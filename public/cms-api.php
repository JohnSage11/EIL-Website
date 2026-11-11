<?php
/**
 * Emmadios Industrial Limited (EIL) — Shared Public CMS State Endpoint for cPanel / Apache
 * Persists and serves eil_site_cms_data.json so all site visitors see admin CMS updates.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$cmsFile = __DIR__ . '/eil_site_cms_data.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($cmsFile)) {
        $raw = @file_get_contents($cmsFile);
        $decoded = @json_decode($raw, true);
        if (is_array($decoded)) {
            echo json_encode(['ok' => true, 'isDefault' => false, 'cmsData' => $decoded]);
            exit;
        }
    }
    echo json_encode(['ok' => true, 'isDefault' => true, 'cmsData' => null]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (file_exists($cmsFile)) {
        @unlink($cmsFile);
    }
    echo json_encode(['ok' => true, 'isDefault' => true, 'cmsData' => null]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = @json_decode($rawInput, true);
    if (isset($payload['action']) && $payload['action'] === 'reset') {
        if (file_exists($cmsFile)) {
            @unlink($cmsFile);
        }
        echo json_encode(['ok' => true, 'isDefault' => true, 'cmsData' => null]);
        exit;
    }
    if (isset($payload['cmsData']) && is_array($payload['cmsData'])) {
        @file_put_contents($cmsFile, json_encode($payload['cmsData'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(['ok' => true, 'isDefault' => false, 'cmsData' => $payload['cmsData']]);
        exit;
    }
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid CMS payload']);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
