const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────
// ESTADO COMPARTIDO
// ─────────────────────────────────────
let estado = {
  mlMeta:      2000,   // Meta diaria enviada desde la app
  mlRestantes: 2000,   // Actualizado por el ESP32
  ultimaActualizacion: null
};

// ─────────────────────────────────────
// ESP32 → SERVIDOR
// Recibe los ml restantes del circuito
// ─────────────────────────────────────
app.get('/esp32/update', (req, res) => {
  const ml = parseInt(req.query.ml);
  if (!isNaN(ml)) {
    estado.mlRestantes          = ml;
    estado.ultimaActualizacion  = new Date().toISOString();
    console.log(`ESP32 reporta: ${ml} ml restantes`);
  }
  // Responde con la meta actual para que el ESP32 la muestre en el LCD
  res.json({ mlMeta: estado.mlMeta });
});

// ─────────────────────────────────────
// APP WEB → SERVIDOR
// Envía la meta diaria calculada
// ─────────────────────────────────────
app.post('/app/meta', (req, res) => {
  const { mlMeta } = req.body;
  if (mlMeta && !isNaN(mlMeta)) {
    estado.mlMeta      = parseInt(mlMeta);
    estado.mlRestantes = parseInt(mlMeta); // reinicia los restantes
    console.log(`App envió meta: ${mlMeta} ml`);
  }
  res.json({ ok: true });
});

// ─────────────────────────────────────
// APP WEB → SERVIDOR
// Consulta el estado actual
// ─────────────────────────────────────
app.get('/app/estado', (req, res) => {
  res.json(estado);
});

// ─────────────────────────────────────
// HEALTH CHECK (Railway lo necesita)
// ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'HYDRABASE servidor activo', estado });
});

// ─────────────────────────────────────
// INICIAR SERVIDOR
// ─────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor HYDRABASE corriendo en puerto ${PORT}`);
});
