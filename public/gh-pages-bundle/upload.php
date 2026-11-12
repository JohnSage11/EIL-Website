<?php
/**
 * Emmadios Industrial Limited (EIL) — Native cPanel / Apache File Upload Endpoint
 * Automatically stores uploaded engineering drawings, BOQs, and POs in /uploads/
 * and returns a permanent public https:// URL for WhatsApp & Email routing.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$uploadsDir = __DIR__ . '/uploads';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

$allowedExtensions = [
    'pdf', 'dwg', 'dxf', 'xlsx', 'xls', 'csv',
    'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'zip', 'txt'
];

$fileData = null;
$originalName = 'document.pdf';

if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $originalName = basename($_FILES['file']['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Unsupported file extension']);
        exit;
    }
    $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
    $uniquePrefix = 'eil-' . time() . '-' . mt_rand(1000, 9999);
    $finalFilename = $uniquePrefix . '-' . $safeName;
    $targetPath = $uploadsDir . '/' . $finalFilename;

    if (!move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to move uploaded file']);
        exit;
    }
} else {
    $rawInput = file_get_contents('php://input');
    $json = json_decode($rawInput, true);
    if (!$json || empty($json['base64Data']) || empty($json['fileName'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'No file provided']);
        exit;
    }
    $originalName = basename($json['fileName']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Unsupported file extension']);
        exit;
    }
    $base64 = $json['base64Data'];
    if (strpos($base64, ',') !== false) {
        $parts = explode(',', $base64, 2);
        $base64 = $parts[1];
    }
    $decoded = base64_decode($base64);
    if ($decoded === false) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid base64 payload']);
        exit;
    }
    $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
    $uniquePrefix = !empty($json['attachmentId'])
        ? preg_replace('/[^a-zA-Z0-9._-]/', '_', $json['attachmentId'])
        : ('eil-' . time() . '-' . mt_rand(1000, 9999));
    $finalFilename = $uniquePrefix . '-' . $safeName;
    $targetPath = $uploadsDir . '/' . $finalFilename;

    if (file_put_contents($targetPath, $decoded) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to write file']);
        exit;
    }
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
$scheme = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'emmadios.com';
$baseDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$publicUrl = $scheme . '://' . $host . $baseDir . '/uploads/' . rawurlencode($finalFilename);

echo json_encode([
    'ok' => true,
    'fileName' => $finalFilename,
    'attachmentUrl' => $publicUrl,
]);
