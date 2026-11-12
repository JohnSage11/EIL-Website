<?php
/**
 * Emmadios Industrial Limited (EIL) — Shared Public CMS State Endpoint for cPanel / Apache
 * Supports both multipart/form-data (WAF-safe) and application/json POST requests,
 * offloads base64 images to /uploads/ so cms-data.json stays small and fast,
 * and tracks explicit updatedAt timestamps so visiting devices sync edits and
 * factory resets accurately without ever wiping out valid cached edits.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Cache-Control, Pragma');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$cmsFile = __DIR__ . '/cms-data.json';
$legacyFile = __DIR__ . '/eil_site_cms_data.json';
$uploadsDir = __DIR__ . '/uploads';

if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0775, true);
}

/**
 * Recursively converts any data:image/...;base64,... strings in the CMS payload
 * into physical image files inside /uploads/ so cms-data.json remains lightweight
 * and loads quickly on mobile phones.
 */
function offloadBase64Images($value, $uploadsDir) {
    if (is_string($value)) {
        if (preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i', $value, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') {
                $ext = 'jpg';
            }
            $binary = @base64_decode($matches[2]);
            if ($binary !== false && strlen($binary) > 64) {
                $hash = substr(md5($binary), 0, 16) . '_' . strlen($binary);
                $fileName = 'cms_img_' . $hash . '.' . $ext;
                $filePath = $uploadsDir . '/' . $fileName;
                if (!file_exists($filePath)) {
                    @file_put_contents($filePath, $binary, LOCK_EX);
                    @chmod($filePath, 0664);
                }
                // Keep compact auto-dimensioned images (<= 350 KB) inline as data URLs
                // so they are 100% self-contained even if /uploads/ permissions vary
                if (strlen($binary) > 358400 && file_exists($filePath)) {
                    return 'uploads/' . $fileName;
                }
                return $value;
            }
        }
        return $value;
    }
    if (is_array($value)) {
        foreach ($value as $k => $v) {
            $value[$k] = offloadBase64Images($v, $uploadsDir);
        }
        return $value;
    }
    return $value;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $targetFile = null;
    if (file_exists($cmsFile) && filesize($cmsFile) > 2) {
        $targetFile = $cmsFile;
    } elseif (file_exists($legacyFile) && filesize($legacyFile) > 2) {
        $targetFile = $legacyFile;
    }

    if ($targetFile) {
        $raw = @file_get_contents($targetFile);
        $decoded = @json_decode($raw, true);
        if (is_array($decoded)) {
            $isFactoryDefault = !empty($decoded['_isFactoryDefault']);
            $updatedAt = isset($decoded['updatedAt']) && is_numeric($decoded['updatedAt'])
                ? (float) $decoded['updatedAt']
                : (@filemtime($targetFile) ? @filemtime($targetFile) * 1000 : round(microtime(true) * 1000));
            $decoded['updatedAt'] = $updatedAt;
            $decoded['_isFactoryDefault'] = $isFactoryDefault;

            echo json_encode([
                'ok' => true,
                'hasSavedState' => true,
                'isDefault' => $isFactoryDefault,
                'updatedAt' => $updatedAt,
                'cmsData' => $decoded,
            ]);
            exit;
        }
    }

    // No saved state file exists on server yet — do NOT instruct clients to wipe their cache!
    echo json_encode([
        'ok' => true,
        'hasSavedState' => false,
        'isDefault' => false,
        'updatedAt' => 0,
        'cmsData' => null,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $action = 'save';
    $cmsData = null;
    $incomingUpdatedAt = null;

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $action = 'reset';
    } else {
        // 1. Check multipart/form-data or application/x-www-form-urlencoded ($_POST)
        if (!empty($_POST)) {
            if (isset($_POST['action'])) {
                $action = (string) $_POST['action'];
            }
            if (isset($_POST['updatedAt']) && is_numeric($_POST['updatedAt'])) {
                $incomingUpdatedAt = (float) $_POST['updatedAt'];
            }
            if (isset($_POST['cmsDataJson'])) {
                $decodedForm = @json_decode($_POST['cmsDataJson'], true);
                if (!is_array($decodedForm)) {
                    $decodedForm = @json_decode(stripslashes($_POST['cmsDataJson']), true);
                }
                if (is_array($decodedForm)) {
                    $cmsData = $decodedForm;
                }
            }
        }

        // 2. Fallback to raw JSON body (php://input)
        if (!is_array($cmsData)) {
            $rawInput = @file_get_contents('php://input');
            if ($rawInput) {
                $payload = @json_decode($rawInput, true);
                if (is_array($payload)) {
                    if (isset($payload['action'])) {
                        $action = (string) $payload['action'];
                    }
                    if (isset($payload['updatedAt']) && is_numeric($payload['updatedAt'])) {
                        $incomingUpdatedAt = (float) $payload['updatedAt'];
                    }
                    if (isset($payload['cmsData']) && is_array($payload['cmsData'])) {
                        $cmsData = $payload['cmsData'];
                    }
                }
            }
        }
    }

    if (is_array($cmsData)) {
        $cmsData = offloadBase64Images($cmsData, $uploadsDir);
        $nowMs = round(microtime(true) * 1000);
        $cmsData['updatedAt'] = $incomingUpdatedAt
            ? $incomingUpdatedAt
            : (isset($cmsData['updatedAt']) && is_numeric($cmsData['updatedAt'])
                ? (float) $cmsData['updatedAt']
                : $nowMs);
        $cmsData['_isFactoryDefault'] = ($action === 'reset') || !empty($cmsData['_isFactoryDefault']);

        $encoded = json_encode($cmsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        @file_put_contents($cmsFile, $encoded, LOCK_EX);
        @chmod($cmsFile, 0664);
        @file_put_contents($legacyFile, $encoded, LOCK_EX);
        @chmod($legacyFile, 0664);

        echo json_encode([
            'ok' => true,
            'hasSavedState' => true,
            'isDefault' => $cmsData['_isFactoryDefault'],
            'updatedAt' => $cmsData['updatedAt'],
            'cmsData' => $cmsData,
        ]);
        exit;
    }

    if ($action === 'reset') {
        $nowMs = $incomingUpdatedAt ? $incomingUpdatedAt : round(microtime(true) * 1000);
        $resetMarker = [
            '_isFactoryDefault' => true,
            'updatedAt' => $nowMs,
        ];
        $encoded = json_encode($resetMarker, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        @file_put_contents($cmsFile, $encoded, LOCK_EX);
        @chmod($cmsFile, 0664);
        @file_put_contents($legacyFile, $encoded, LOCK_EX);
        @chmod($legacyFile, 0664);

        echo json_encode([
            'ok' => true,
            'hasSavedState' => true,
            'isDefault' => true,
            'updatedAt' => $nowMs,
            'cmsData' => null,
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid CMS payload']);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
