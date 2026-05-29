const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────
// ESTADO — sin valores fijos, espera la app
// ─────────────────────────────────────
let estado = {
  mlMeta:      0,    // Se llena cuando la app envía los datos del usuario
  mlRestantes: 0,    // Se actualiza cuando el ESP32 presiona el botón
  ultimaActualizacion: null
};

// ─────────────────────────────────────
// ESP32 → SERVIDOR
// ─────────────────────────────────────
app.get('/esp32/update', (req, res) => {
  const ml = parseInt(req.query.ml);
  if (!isNaN(ml) && estado.mlMeta > 0) {
    estado.mlRestantes         = ml;
    estado.ultimaActualizacion = new Date().toISOString();
    console.log(`ESP32 reporta: ${ml} ml restantes`);
  }
  res.json({ mlMeta: estado.mlMeta });
});

// ─────────────────────────────────────
// APP WEB → SERVIDOR
// Recibe la meta calculada según el usuario
// ─────────────────────────────────────
app.post('/app/meta', (req, res) => {
  const { mlMeta } = req.body;
  if (mlMeta && !isNaN(mlMeta) && mlMeta > 0) {
    estado.mlMeta              = parseInt(mlMeta);
    estado.mlRestantes         = parseInt(mlMeta); // inicia con la meta completa
    estado.ultimaActualizacion = new Date().toISOString();
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
// HEALTH CHECK
// ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'HYDRABASE servidor activo', estado });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor HYDRABASE corriendo en puerto ${PORT}`);
});
