import express from 'express';
import cors from 'cors';

import aceitesRoutes from './routes/aceites.js';
import infempresaRoutes from './routes/infempresa.js';
import clientesRoutes from './routes/clientes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/aceites', aceitesRoutes);
app.use('/api/empresa', infempresaRoutes);
app.use('/api/clientes', clientesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});