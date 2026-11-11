// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_FILE = path.join(__dirname, "submissions-store.json");
function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read store:", err);
  }
  const initial = {
    quotes: [
      {
        id: "q-sample-1",
        createdAt: new Date(Date.now() - 864e5 * 2).toISOString(),
        referenceCode: "EIL-QT-8401",
        customerName: "Engr. Tunde Adebayo",
        companyName: "Delta Marine & Pipeline Works Ltd",
        positionTitle: "Lead Fabrication Engineer",
        email: "t.adebayo@deltamarine-ng.com",
        phone: "+234 803 412 8890",
        serviceType: "Fabrication (Modular Skids, Pipe Bridges, Gangways, Racks)",
        quantityOrDuration: "2 Modular Skids + 45m Pipe Spooling",
        location: "Trans-Amadi Industrial Layout, Port Harcourt",
        preferredBranch: "Corporate Head Office \u2014 Rumueme, Port Harcourt",
        projectNotes: "Carbon and stainless steel pipe spool fabrication to ASME/nuclear sector standard with on-site installation.",
        attachmentName: "DM_Modular_Skid_Isometrics_Rev3.pdf",
        attachmentSize: 428500,
        attachmentType: "application/pdf",
        status: "Reviewed"
      }
    ],
    enquiries: [
      {
        id: "e-sample-1",
        createdAt: new Date(Date.now() - 36e5 * 14).toISOString(),
        referenceCode: "EIL-ENQ-5092",
        customerName: "Chukwuma Okafor",
        companyName: "Rivers Heavy Fabrication Contractors",
        email: "procurement@riversfab.com",
        phone: "+234 706 119 3400",
        orderMode: "EIL Point Card Voucher",
        pointCardNumber: "EIL-PC-00419",
        preferredBranch: "Old Aba Road Branch \u2014 Port Harcourt",
        deliveryAddress: "Plot 44 Onne Oil & Gas Free Zone, Rivers State",
        notes: "Mix and match manifold rack delivery required with crane lift certification.",
        items: [
          {
            id: "ge-mixer-1",
            name: "Heavy-Duty Acetylene Mixer (Combi Mixer)",
            category: "Gas Equipment",
            subcategory: "Mixers (Combi Mixers)",
            spec: "Combi Heavy-Duty Oxy-Acetylene Torch Mixer",
            quantity: 4,
            unit: "Units",
            pointsEligible: true
          },
          {
            id: "ge-reg-1",
            name: "Series 9500 Multi-Stage Regulator (Oxygen)",
            category: "Gas Equipment",
            subcategory: "Industrial Regulators",
            spec: "Heavy-Duty Multi-Stage Oxygen Pressure Regulator",
            quantity: 4,
            unit: "Units",
            pointsEligible: true
          },
          {
            id: "gas-del-2",
            name: "Compressed Cylinders in Lift-Tested Racks",
            category: "Industrial Gas",
            subcategory: "Gas Delivery Options",
            spec: "Mix & Match 2x Oxygen, 1x Acetylene, 1x Argon Bank",
            quantity: 2,
            unit: "Racks",
            pointsEligible: true
          }
        ],
        status: "Processing"
      }
    ]
  };
  saveStore(initial);
  return initial;
}
function saveStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write store:", err);
  }
}
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.get("/api/submissions", (_req, res) => {
    const store = loadStore();
    res.json(store);
  });
  app.post("/api/quotes", (req, res) => {
    const store = loadStore();
    const body = req.body;
    const referenceCode = `EIL-QT-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newQuote = {
      id: `q-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      referenceCode,
      customerName: body.customerName || "",
      companyName: body.companyName || "",
      positionTitle: body.positionTitle || "",
      email: body.email || "",
      phone: body.phone || "",
      serviceType: body.serviceType || "Fabrication",
      quantityOrDuration: body.quantityOrDuration || "",
      location: body.location || "Nigeria",
      preferredBranch: body.preferredBranch || "Corporate Head Office \u2014 Rumueme, Port Harcourt",
      projectNotes: body.projectNotes || "",
      attachmentName: body.attachmentName,
      attachmentSize: body.attachmentSize,
      attachmentType: body.attachmentType,
      status: "New"
    };
    store.quotes.unshift(newQuote);
    saveStore(store);
    res.status(201).json(newQuote);
  });
  app.post("/api/enquiries", (req, res) => {
    const store = loadStore();
    const body = req.body;
    const referenceCode = `EIL-ENQ-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newEnquiry = {
      id: `e-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      referenceCode,
      customerName: body.customerName || "",
      companyName: body.companyName || "",
      email: body.email || "",
      phone: body.phone || "",
      orderMode: body.orderMode || "Registered Customer Order",
      pointCardNumber: body.pointCardNumber || "",
      preferredBranch: body.preferredBranch || "Corporate Head Office \u2014 Rumueme, Port Harcourt",
      deliveryAddress: body.deliveryAddress || "",
      notes: body.notes || "",
      attachmentName: body.attachmentName,
      items: Array.isArray(body.items) ? body.items : [],
      status: "New"
    };
    store.enquiries.unshift(newEnquiry);
    saveStore(store);
    res.status(201).json(newEnquiry);
  });
  app.patch("/api/submissions/:type/:id/status", (req, res) => {
    const { type, id } = req.params;
    const { status } = req.body;
    const store = loadStore();
    if (type === "quote") {
      const found = store.quotes.find((q) => q.id === id);
      if (found && status) {
        found.status = status;
        saveStore(store);
        return res.json(found);
      }
    } else if (type === "enquiry") {
      const found = store.enquiries.find((e) => e.id === id);
      if (found && status) {
        found.status = status;
        saveStore(store);
        return res.json(found);
      }
    }
    return res.status(404).json({ error: "Submission not found" });
  });
  const publicPath = path.join(__dirname, "public");
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(__dirname, "dist", "index.html"));
  if (!isProd || process.env.VITE_DEV === "true") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const PORT = Number(process.env.PORT) || 3e3;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EIL Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
