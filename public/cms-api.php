<?php
/**
 * Emmadios Industrial Limited (EIL) — Shared Public CMS State Endpoint for cPanel / Apache
 * Persists and serves cms-data.json so all site visitors (PC & Mobile) see admin CMS updates
 * and factory default restores immediately without stale browser or localStorage caching.
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $targetFile = file_exists($cmsFile) ? $cmsFile : (file_exists($legacyFile) ? $legacyFile : null);
    if ($targetFile && file_exists($targetFile)) {
        $raw = @file_get_contents($targetFile);
        $decoded = @json_decode($raw, true);
        if (is_array($decoded)) {
            $isFactoryDefault = !empty($decoded['_isFactoryDefault']);
            $updatedAt = isset($decoded['updatedAt']) ? $decoded['updatedAt'] : round(microtime(true) * 1000);
            echo json_encode([
                'ok' => true,
                'isDefault' => $isFactoryDefault,
                'updatedAt' => $updatedAt,
                'cmsData' => $decoded,
            ]);
            exit;
        }
    }
    echo json_encode([
        'ok' => true,
        'isDefault' => true,
        'updatedAt' => round(microtime(true) * 1000),
        'cmsData' => null,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (file_exists($cmsFile)) {
        @unlink($cmsFile);
    }
    if (file_exists($legacyFile)) {
        @unlink($legacyFile);
    }
    echo json_encode([
        'ok' => true,
        'isDefault' => true,
        'updatedAt' => round(microtime(true) * 1000),
        'cmsData' => null,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = @json_decode($rawInput, true);
    $action = isset($payload['action']) ? $payload['action'] : 'save';

    if (isset($payload['cmsData']) && is_array($payload['cmsData'])) {
        $cmsData = $payload['cmsData'];
        $cmsData['updatedAt'] = isset($cmsData['updatedAt']) && is_numeric($cmsData['updatedAt'])
            ? $cmsData['updatedAt']
            : round(microtime(true) * 1000);
        $cmsData['_isFactoryDefault'] = ($action === 'reset') || !empty($cmsData['_isFactoryDefault']);

        @file_put_contents(
            $cmsFile,
            json_encode($cmsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        if (file_exists($legacyFile)) {
            @unlink($legacyFile);
        }

        echo json_encode([
            'ok' => true,
            'isDefault' => $cmsData['_isFactoryDefault'],
            'updatedAt' => $cmsData['updatedAt'],
            'cmsData' => $cmsData,
        ]);
        exit;
    }

    if ($action === 'reset') {
        $resetMarker = [
            '_isFactoryDefault' => true,
            'updatedAt' => round(microtime(true) * 1000),
        ];
        @file_put_contents(
            $cmsFile,
            json_encode($resetMarker, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
        if (file_exists($legacyFile)) {
            @unlink($legacyFile);
        }
        echo json_encode([
            'ok' => true,
            'isDefault' => true,
            'updatedAt' => $resetMarker['updatedAt'],
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
