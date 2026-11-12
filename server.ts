import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'submissions-store.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

interface QuoteSubmission {
  id: string;
  createdAt: string;
  referenceCode: string;
  customerName: string;
  companyName: string;
  positionTitle: string;
  email: string;
  phone: string;
  serviceType: string;
  quantityOrDuration: string;
  location: string;
  preferredBranch: string;
  projectNotes: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  attachmentUrl?: string;
  status: 'New' | 'Reviewed' | 'Quoted';
}

interface EnquiryItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  spec: string;
  quantity: number;
  unit: string;
  pointsEligible: boolean;
}

interface EnquirySubmission {
  id: string;
  createdAt: string;
  referenceCode: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  orderMode: 'Registered Customer Order' | 'Counter Service (Walk-in)' | 'EIL Point Card Voucher';
  pointCardNumber?: string;
  preferredBranch: string;
  deliveryAddress: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
  items: EnquiryItem[];
  status: 'New' | 'Processing' | 'Dispatched';
}

interface StoreData {
  quotes: QuoteSubmission[];
  enquiries: EnquirySubmission[];
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (!/Rumueme|Oxy-Acetylene|Gas Equipment|Industrial Gas/i.test(raw)) {
        return JSON.parse(raw) as StoreData;
      }
    }
  } catch (err) {
    console.error('Failed to read store:', err);
  }
  const initial: StoreData = {
    quotes: [
      {
        id: 'q-sample-1',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        referenceCode: 'EIL-QT-8401',
        customerName: 'Engr. Tunde Adebayo',
        companyName: 'Delta Marine & Heavy Logistics Ltd',
        positionTitle: 'Plant & Logistics Manager',
        email: 't.adebayo@deltamarine-ng.com',
        phone: '+234 703 825 9142',
        serviceType: 'Equipment Hiring / Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
        quantityOrDuration: '1x 50T Mobile Crane + 1x 20T Excavator (Flexible Project Schedule)',
        location: 'Trans-Amadi Industrial Layout, Port Harcourt',
        preferredBranch: 'Port Harcourt Head Office — Plot 213, Old Aba Road, Rumuogba-Obio',
        projectNotes: 'Heavy crane lifting and earthmoving support with lowbed mobilization to project site.',
        attachmentName: 'Site_Mobilization_Scope_Rev3.pdf',
        attachmentSize: 428500,
        attachmentType: 'application/pdf',
        status: 'Reviewed',
      },
    ],
    enquiries: [
      {
        id: 'e-sample-1',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
        referenceCode: 'EIL-ENQ-5092',
        customerName: 'Chukwuma Okafor',
        companyName: 'Rivers Civil & Marine Contractors',
        email: 'procurement@riverscivil.com',
        phone: '+234 703 825 9142',
        orderMode: 'EIL Point Card Voucher',
        pointCardNumber: 'EIL-PC-00419',
        preferredBranch: 'Port Harcourt Head Office — Plot 213, Old Aba Road, Rumuogba-Obio',
        deliveryAddress: 'Plot 44 Onne Oil & Gas Free Zone, Rivers State',
        notes: 'Lowbed trailer mobilization required for excavator and forklift deployment to Onne site.',
        items: [
          {
            id: 'fk-5t-diesel',
            name: '5-Ton Heavy-Duty Diesel Forklift',
            category: 'Forklifts (All Tonnages)',
            subcategory: '3T – 7T Industrial Forklifts',
            spec: '5,000 kg Rated Load · Dual-Stage Mast · Yard & Warehouse Lifting',
            quantity: 2,
            unit: 'Units (Hire)',
            pointsEligible: true,
          },
          {
            id: 'ex-20t-30t-tracked',
            name: '20T – 30T Hydraulic Tracked Excavator (CAT 320 / 330 Class)',
            category: 'Excavators & Earthmoving',
            subcategory: 'Tracked Hydraulic Excavators',
            spec: '1.2 m³ – 1.8 m³ Bucket · Heavy Trenching, Dredging & Civil Earthworks',
            quantity: 1,
            unit: 'Units (Hire)',
            pointsEligible: true,
          },
          {
            id: 'hl-lowbed-40t-60t',
            name: '40T – 60T Multi-Axle Lowbed Trailer (Equipment Carrier)',
            category: 'Haulage Services (Trucks & Trailers)',
            subcategory: 'Lowbed Trailers',
            spec: 'Hydraulic Rear Ramps · Heavy Winch · Outriggers for Excavators & Dozers',
            quantity: 1,
            unit: 'Trips / Charter',
            pointsEligible: true,
          },
        ],
        status: 'Processing',
      },
    ],
  };
  saveStore(initial);
  return initial;
}

function saveStore(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store:', err);
  }
}

function sanitizeSegment(input: string): string {
  return String(input || '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadBufferToPublicCloud(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const safeName = sanitizeSegment(fileName) || 'document.pdf';
  const contentType = mimeType || 'application/octet-stream';
  const uint8 = new Uint8Array(buffer);

  // Primary Permanent Host: OnlyFiles.com with expire="0" (Forever)
  try {
    const form = new FormData();
    form.append('file', new Blob([uint8], { type: contentType }), safeName);
    form.append('expire', '0');
    const resp = await fetch('https://api.onlyfiles.com/v1/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: form,
    });
    if (resp.ok) {
      const data = (await resp.json()) as {
        status?: boolean;
        data?: {
          file?: {
            url?: {
              full?: string;
              short?: string;
            };
          };
        };
      };
      const fullUrl = data?.data?.file?.url?.full || data?.data?.file?.url?.short || '';
      if (fullUrl && fullUrl.startsWith('http')) {
        return fullUrl;
      }
    }
  } catch {
    // Fallback to secondary permanent host if OnlyFiles is unreachable
  }

  // Secondary Permanent Host: Catbox permanent storage (no expiry)
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', new Blob([uint8], { type: contentType }), safeName);
    const resp = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });
    if (resp.ok) {
      const urlText = (await resp.text()).trim();
      if (urlText.startsWith('https://')) {
        return urlText;
      }
    }
  } catch {
    // Fallback to local route
  }

  return '';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.post('/api/attachments', async (req, res) => {
    try {
      const { attachmentId, fileName, mimeType, base64Data } = req.body || {};
      if (!attachmentId || !fileName || !base64Data) {
        return res.status(400).json({ error: 'Missing attachment fields' });
      }
      const safeId = sanitizeSegment(attachmentId);
      const safeName = sanitizeSegment(fileName);
      const storedFilePath = path.join(UPLOADS_DIR, `${safeId}__${safeName}`);
      const metaFilePath = path.join(UPLOADS_DIR, `${safeId}__${safeName}.meta.json`);

      const cleanedBase64 = String(base64Data).includes(',')
        ? String(base64Data).split(',')[1]
        : String(base64Data);
      const buffer = Buffer.from(cleanedBase64, 'base64');

      fs.writeFileSync(storedFilePath, buffer);
      fs.writeFileSync(
        metaFilePath,
        JSON.stringify({
          originalName: fileName,
          safeName,
          mimeType: mimeType || 'application/octet-stream',
          size: buffer.length,
          uploadedAt: new Date().toISOString(),
        }),
        'utf-8'
      );

      const relativeUrl = `/api/attachments/${encodeURIComponent(safeId)}/${encodeURIComponent(safeName)}`;
      const cloudUrl = await uploadBufferToPublicCloud(
        buffer,
        fileName,
        mimeType || 'application/octet-stream'
      );

      return res.status(201).json({
        ok: true,
        attachmentId: safeId,
        fileName: safeName,
        attachmentUrl: cloudUrl || relativeUrl,
        publicCloudUrl: cloudUrl || '',
        localUrl: relativeUrl,
      });
    } catch (err) {
      console.error('Failed to store attachment:', err);
      return res.status(500).json({ error: 'Failed to store attachment' });
    }
  });

  const CMS_FILE = path.join(__dirname, 'cms-store.json');
  const PUBLIC_CMS_FILE = path.join(__dirname, 'public', 'cms-data.json');

  const setNoCacheHeaders = (res: express.Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  };

  const offloadServerBase64Images = (val: unknown): unknown => {
    if (typeof val === 'string') {
      const match = val.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        try {
          const buf = Buffer.from(match[2], 'base64');
          if (buf.length > 64) {
            const hash = buf.subarray(0, 32).toString('hex').slice(0, 16) + '_' + buf.length;
            const fileName = `cms_img_${hash}.${ext}`;
            const filePath = path.join(UPLOADS_DIR, fileName);
            if (!fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, buf);
            }
            const publicUploadsDir = path.join(__dirname, 'public', 'uploads');
            if (!fs.existsSync(publicUploadsDir)) {
              fs.mkdirSync(publicUploadsDir, { recursive: true });
            }
            const publicFilePath = path.join(publicUploadsDir, fileName);
            if (!fs.existsSync(publicFilePath)) {
              fs.writeFileSync(publicFilePath, buf);
            }
            return `uploads/${fileName}`;
          }
        } catch {
          // keep original string
        }
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map((item) => offloadServerBase64Images(item));
    }
    if (val && typeof val === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        out[k] = offloadServerBase64Images(v);
      }
      return out;
    }
    return val;
  };

  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/cms', (_req, res) => {
    setNoCacheHeaders(res);
    try {
      const targetFile = fs.existsSync(CMS_FILE)
        ? CMS_FILE
        : fs.existsSync(PUBLIC_CMS_FILE)
        ? PUBLIC_CMS_FILE
        : null;
      if (targetFile) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        const cmsData = JSON.parse(raw);
        if (cmsData && typeof cmsData === 'object') {
          const isDefault = Boolean(cmsData._isFactoryDefault);
          const updatedAt =
            typeof cmsData.updatedAt === 'number'
              ? cmsData.updatedAt
              : fs.statSync(targetFile).mtimeMs;
          return res.json({
            ok: true,
            hasSavedState: true,
            isDefault,
            updatedAt,
            cmsData: {
              ...cmsData,
              updatedAt,
              _isFactoryDefault: isDefault,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to read CMS store:', err);
    }
    return res.json({
      ok: true,
      hasSavedState: false,
      isDefault: false,
      updatedAt: 0,
      cmsData: null,
    });
  });

  app.post('/api/cms', (req, res) => {
    setNoCacheHeaders(res);
    try {
      const { action, updatedAt, cmsData } = req.body || {};
      if (!cmsData || typeof cmsData !== 'object') {
        return res.status(400).json({ ok: false, error: 'Invalid cmsData payload' });
      }
      const processed = offloadServerBase64Images(cmsData) as Record<string, unknown>;
      const resolvedUpdatedAt =
        typeof updatedAt === 'number'
          ? updatedAt
          : typeof processed.updatedAt === 'number'
          ? (processed.updatedAt as number)
          : Date.now();
      const stamped = {
        ...processed,
        updatedAt: resolvedUpdatedAt,
        _isFactoryDefault: action === 'reset' || Boolean(processed._isFactoryDefault),
      };
      const serialized = JSON.stringify(stamped, null, 2);
      fs.writeFileSync(CMS_FILE, serialized, 'utf-8');
      try {
        fs.writeFileSync(PUBLIC_CMS_FILE, serialized, 'utf-8');
      } catch {
        // ignore if public dir not writable
      }
      return res.json({
        ok: true,
        hasSavedState: true,
        isDefault: stamped._isFactoryDefault,
        updatedAt: stamped.updatedAt,
        cmsData: stamped,
      });
    } catch (err) {
      console.error('Failed to write CMS store:', err);
      return res.status(500).json({ ok: false, error: 'Failed to save CMS state' });
    }
  });

  app.delete('/api/cms', (_req, res) => {
    setNoCacheHeaders(res);
    try {
      const nowMs = Date.now();
      const resetMarker = JSON.stringify({ _isFactoryDefault: true, updatedAt: nowMs }, null, 2);
      fs.writeFileSync(CMS_FILE, resetMarker, 'utf-8');
      try {
        fs.writeFileSync(PUBLIC_CMS_FILE, resetMarker, 'utf-8');
      } catch {
        // ignore
      }
      return res.json({
        ok: true,
        hasSavedState: true,
        isDefault: true,
        updatedAt: nowMs,
        cmsData: null,
      });
    } catch (err) {
      console.error('Failed to reset CMS store:', err);
      return res.status(500).json({ ok: false, error: 'Failed to reset CMS state' });
    }
  });

  app.get('/api/attachments/:attachmentId/:fileName', (req, res) => {
    const safeId = sanitizeSegment(req.params.attachmentId);
    const safeName = sanitizeSegment(req.params.fileName);
    const storedFilePath = path.join(UPLOADS_DIR, `${safeId}__${safeName}`);
    const metaFilePath = path.join(UPLOADS_DIR, `${safeId}__${safeName}.meta.json`);

    if (!fs.existsSync(storedFilePath)) {
      return res.status(404).send('Attachment not found.');
    }

    let mimeType = 'application/octet-stream';
    let downloadName = safeName;
    if (fs.existsSync(metaFilePath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));
        if (meta.mimeType) mimeType = meta.mimeType;
        if (meta.originalName) downloadName = meta.originalName;
      } catch {
        // Fallback to defaults
      }
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${String(downloadName).replace(/"/g, '')}"`
    );
    return res.sendFile(storedFilePath);
  });

  app.get('/api/submissions', (_req, res) => {
    const store = loadStore();
    res.json(store);
  });

  app.post('/api/quotes', (req, res) => {
    const store = loadStore();
    const body = req.body;
    const referenceCode =
      body.referenceCode || `EIL-QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: QuoteSubmission = {
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
      referenceCode,
      customerName: body.customerName || '',
      companyName: body.companyName || '',
      positionTitle: body.positionTitle || '',
      email: body.email || '',
      phone: body.phone || '',
      serviceType: body.serviceType || 'Equipment Hiring / Leasing',
      quantityOrDuration: body.quantityOrDuration || '',
      location: body.location || 'Nigeria',
      preferredBranch: body.preferredBranch || 'Port Harcourt Head Office — Plot 213, Old Aba Road, Rumuogba-Obio',
      projectNotes: body.projectNotes || '',
      attachmentName: body.attachmentName,
      attachmentSize: body.attachmentSize,
      attachmentType: body.attachmentType,
      attachmentUrl: body.attachmentUrl,
      status: 'New',
    };
    store.quotes.unshift(newQuote);
    saveStore(store);
    res.status(201).json({ submission: newQuote });
  });

  app.post('/api/enquiries', (req, res) => {
    const store = loadStore();
    const body = req.body;
    const referenceCode =
      body.referenceCode || `EIL-ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry: EnquirySubmission = {
      id: `e-${Date.now()}`,
      createdAt: new Date().toISOString(),
      referenceCode,
      customerName: body.customerName || '',
      companyName: body.companyName || '',
      email: body.email || '',
      phone: body.phone || '',
      orderMode: body.orderMode || 'Registered Customer Order',
      pointCardNumber: body.pointCardNumber || '',
      preferredBranch: body.preferredBranch || 'Port Harcourt Head Office — Plot 213, Old Aba Road, Rumuogba-Obio',
      deliveryAddress: body.deliveryAddress || '',
      notes: body.notes || '',
      attachmentName: body.attachmentName,
      attachmentUrl: body.attachmentUrl,
      items: Array.isArray(body.items) ? body.items : [],
      status: 'New',
    };
    store.enquiries.unshift(newEnquiry);
    saveStore(store);
    res.status(201).json({ submission: newEnquiry });
  });

  app.patch('/api/submissions/:type/:id/status', (req, res) => {
    const { type, id } = req.params;
    const { status } = req.body;
    const store = loadStore();
    if (type === 'quote') {
      const found = store.quotes.find((q) => q.id === id);
      if (found && status) {
        found.status = status;
        saveStore(store);
        return res.json(found);
      }
    } else if (type === 'enquiry') {
      const found = store.enquiries.find((e) => e.id === id);
      if (found && status) {
        found.status = status;
        saveStore(store);
        return res.json(found);
      }
    }
    return res.status(404).json({ error: 'Submission not found' });
  });

  const publicPath = path.join(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd || process.env.VITE_DEV === 'true') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EIL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
