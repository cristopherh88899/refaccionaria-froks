import { useEffect, useState } from 'react';
import './App.css';

const IMAGENES = [
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
  "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600&q=80",
];

function App() {
  const [aceites, setAceites] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [form, setForm] = useState({ nombre: '', tipo: 'Sintético', precio: '', stock: '', descripcion: '' });

  const [tabConsulta, setTabConsulta] = useState('porTipo');
  const [consultaTipo, setConsultaTipo] = useState('Sintético');

  // ===== CLIENTES - MYSQL =====
  const [clientes, setClientes] = useState([]);
  const [formCliente, setFormCliente] = useState({ nombre: '', compra: '', tipo: 'Sintético', total: '' });

  const cargarClientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/clientes');
      const data = await res.json();
      setClientes(data);
    } catch (e) {
      console.log('Error cargando clientes', e);
    }
  };

  const registrarCliente = async (e) => {
    e.preventDefault();
    const hoy = new Date().toISOString().slice(0, 10);
    const res = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formCliente, total: Number(formCliente.total), fecha: hoy })
    });
    const data = await res.json();
    if (!res.ok) {
      alert('❌ Error: ' + data.error);
      return;
    }
    setFormCliente({ nombre: '', compra: '', tipo: 'Sintético', total: '' });
    await cargarClientes();
    alert('✅ Cliente guardado en MySQL!');
  };

  const eliminarCliente = async (id) => {
    if (!confirm('¿Borrar este cliente?')) return;
    await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' });
    cargarClientes();
  };

  // ===== CARRITO =====
  const [carrito, setCarrito] = useState([]);
  const [mostrarPedido, setMostrarPedido] = useState(false);

  const agregarAlPedido = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    alert(`✅ ${producto.nombre} agregado a tu pedido`);
  };

  const quitarDelPedido = (id) => setCarrito(carrito.filter(p => p.id !== id));
  const vaciarPedido = () => setCarrito([]);
  const totalPedido = carrito.reduce((s, p) => s + Number(p.precio) * p.cantidad, 0);
  const cantidadTotal = carrito.reduce((s, p) => s + p.cantidad, 0);

  const cargar = async () => {
    const res = await fetch('http://localhost:3000/api/aceites');
    const data = await res.json();
    setAceites(data);
  };

  useEffect(() => { cargar(); cargarClientes(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/aceites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ nombre: '', tipo: 'Sintético', precio: '', stock: '', descripcion: '' });
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Borrar este aceite?')) return;
    await fetch(`http://localhost:3000/api/aceites/${id}`, { method: 'DELETE' });
    cargar();
  };

  const filtrados = aceites.filter(a => {
    const coincideBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === 'Todos' || a.tipo === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  const totalStock = aceites.reduce((acc, a) => acc + Number(a.stock), 0);
  const valorTotal = aceites.reduce((acc, a) => acc + Number(a.precio) * Number(a.stock), 0);

  const porTipoConsulta = aceites.filter(a => a.tipo === consultaTipo);
  const pocoStock = aceites.filter(a => Number(a.stock) <= 5);
  const ventasPorTipo = ['Sintético','Mineral','Semi-Sintético','Esencial','Automotriz'].map(t => {
    const lista = aceites.filter(a => a.tipo === t);
    return {
      tipo: t,
      cantidad: lista.length,
      stock: lista.reduce((s, a) => s + Number(a.stock), 0),
      valor: lista.reduce((s, a) => s + Number(a.precio) * Number(a.stock), 0)
    };
  });

  // ===== ARREGLO DEL ACENTO: Sintetico == Sintético =====
  const quitarAcentos = (texto) => (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const clientesFiltrados = clientes.filter(c => tabConsulta === 'clientes' ? quitarAcentos(c.tipo) === quitarAcentos(consultaTipo) : true);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🛢️ EcoAceites <span>& Lubricantes S.A.</span></div>
        <nav className="menu">
          <a href="#tabla">Productos</a>
          <a href="#consultas" onClick={() => setTabConsulta('clientes')}>Clientes</a>
          <a href="#consultas" className="pedido">🔍 Consultas</a>
          <a href="#pedido" onClick={() => setMostrarPedido(true)} className="pedido">🛒 Mi pedido ({cantidadTotal})</a>
          <a href="#ofertas">🏷️ Ofertas</a>
          <a href="#contacto">📞 Contacto</a>
        </nav>
        <div className="header-info">
          <span>📍 Tula, Hidalgo</span>
          <button className="btn-login">Iniciar Sesión</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="badge">✦ #1 EN LUBRICANTES</span>
          <h1>EcoAceites & <br/><span>Lubricantes S.A.</span></h1>
          <p>Protege tu motor con lo mejor. Aceites sintéticos, minerales y esenciales con calidad certificada.</p>
          <div className="hero-stats">
            <div><b>{aceites.length}</b><small>Productos</small></div>
            <div><b>{totalStock}</b><small>En Stock</small></div>
            <div><b>${valorTotal.toLocaleString()}</b><small>Valor Inventario</small></div>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80" alt="Motor" />
      </section>

      {mostrarPedido && (
        <section id="pedido" className="seccion-tabla">
          <div style={{ background: 'white', padding: 20, borderRadius: 15, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>🛒 Mi pedido ({cantidadTotal})</h2>
              <button onClick={() => setMostrarPedido(false)} style={{ border: 'none', background: '#eee', padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold' }}>✖ Cerrar</button>
            </div>
            {carrito.length === 0 ? <p>No has agregado nada todavía. Dale en Agregar en el catálogo 👇</p> : (
              <>
                <div className="tabla-wrap" style={{ marginTop: 15 }}><table><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
                <tbody>{carrito.map(p => (
                  <tr key={p.id}><td><b>{p.nombre}</b></td><td>${Number(p.precio).toLocaleString()}</td><td>{p.cantidad}</td><td><b>${(Number(p.precio) * p.cantidad).toLocaleString()}</b></td><td><button onClick={() => quitarDelPedido(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>🗑️</button></td></tr>
                ))}</tbody></table></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ margin: 0 }}>Total: ${totalPedido.toLocaleString()}</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={vaciarPedido} style={{ background: '#eee', border: 'none', padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}>Vaciar</button>
                    <button onClick={() => alert('✅ Pedido confirmado! Total: $' + totalPedido.toLocaleString())} style={{ background: '#4A2C1A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}>✅ Confirmar pedido</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section id="ofertas" className="seccion-tabla" style={{ marginTop: 20 }}>
        <h2>🏷️ Ofertas de la semana</h2>
        <p style={{ color: '#666', marginTop: 0 }}>Aprovecha, solo esta semana.</p>
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <div style={{ background: '#FFEB3B', padding: 20, borderRadius: 15, flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>🔥 2x1 en Sintético</h3>
            <p>Compra un Aceite 5W-30 y llévate el segundo a mitad de precio.</p>
            <b>Hasta el domingo</b>
          </div>
          <div style={{ background: '#FFCCBC', padding: 20, borderRadius: 15, flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>🚗 20% en Mineral</h3>
            <p>Todos los aceites Minerales con 20% de descuento en tienda.</p>
            <b>Solo en Tula</b>
          </div>
          <div style={{ background: '#C8E6C9', padding: 20, borderRadius: 15, flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>🎁 Envío gratis</h3>
            <p>En pedidos mayores a $500 dentro de Tula, Hidalgo.</p>
            <b>¡Aprovecha!</b>
          </div>
        </div>
      </section>

      <section id="consultas" className="seccion-tabla" style={{ marginTop: 25 }}>
        <h2>🔍 Consultas</h2>
        <p style={{ color: '#666', marginTop: 0 }}>Busca productos por tipo, ventas por tipo, clientes y poco stock.</p>
        <div className="filtros" style={{ marginBottom: 15 }}>
          <button className={tabConsulta === 'porTipo' ? 'active' : ''} onClick={() => setTabConsulta('porTipo')}>Productos por tipo</button>
          <button className={tabConsulta === 'ventas' ? 'active' : ''} onClick={() => setTabConsulta('ventas')}>Ventas por tipo</button>
          <button className={tabConsulta === 'clientes' ? 'active' : ''} onClick={() => setTabConsulta('clientes')}>Clientes ({clientes.length})</button>
          <button className={tabConsulta === 'pocoStock' ? 'active' : ''} onClick={() => setTabConsulta('pocoStock')}>Poco stock ⚠️</button>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 15, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {(tabConsulta === 'porTipo' || tabConsulta === 'clientes') && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
              <select value={consultaTipo} onChange={e => setConsultaTipo(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', flex: 1 }}>
                <option>Sintético</option><option>Mineral</option><option>Semi-Sintético</option><option>Esencial</option><option>Automotriz</option>
              </select>
              <button className="btn-guardar" style={{ width: 'auto', margin: 0, padding: '10px 25px' }}>Consultar</button>
            </div>
          )}

          {tabConsulta === 'porTipo' && (
            porTipoConsulta.length === 0 ? <p>No hay productos de tipo <b>{consultaTipo}</b></p> : (
              <div className="tabla-wrap"><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>Descripción</th></tr></thead>
              <tbody>{porTipoConsulta.map(a => (
                <tr key={a.id}><td><b>{a.nombre}</b></td><td>{a.tipo}</td><td>${Number(a.precio).toLocaleString()}</td><td>{a.stock}</td><td>{a.descripcion || 'Sin descripción'}</td></tr>
              ))}</tbody></table></div>
            )
          )}

          {tabConsulta === 'ventas' && (
            <div className="tabla-wrap"><table><thead><tr><th>Tipo</th><th>Productos</th><th>Stock total</th><th>Valor en inventario</th></tr></thead>
            <tbody>{ventasPorTipo.map(v => (
              <tr key={v.tipo}><td><b>{v.tipo}</b></td><td>{v.cantidad}</td><td>{v.stock}</td><td>${v.valor.toLocaleString()}</td></tr>
            ))}</tbody></table></div>
          )}

          {tabConsulta === 'clientes' && (
            <>
              <form onSubmit={registrarCliente} style={{ background: '#FFF8E1', padding: 15, borderRadius: 12, marginBottom: 15 }}>
                <h3 style={{ margin: '0 0 10px' }}>➕ Registrar nuevo cliente</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input placeholder="Nombre del cliente Ej: Pedro Gómez" value={formCliente.nombre} onChange={e => setFormCliente({...formCliente, nombre: e.target.value})} required style={{ flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder="¿Qué compró? Ej: Aceite 5W-30" value={formCliente.compra} onChange={e => setFormCliente({...formCliente, compra: e.target.value})} required style={{ flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                  <select value={formCliente.tipo} onChange={e => setFormCliente({...formCliente, tipo: e.target.value})} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
                    <option>Sintético</option><option>Mineral</option><option>Semi-Sintético</option><option>Esencial</option><option>Automotriz</option>
                  </select>
                  <input type="number" placeholder="Total $ Ej: 350" value={formCliente.total} onChange={e => setFormCliente({...formCliente, total: e.target.value})} required style={{ width: 130, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
                  <button type="submit" style={{ background: '#4A2C1A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>💾 Registrar cliente</button>
                </div>
              </form>

              {clientesFiltrados.length === 0 ? <p>No hay clientes de tipo <b>{consultaTipo}</b>. Cambia el filtro a otro tipo o registra uno arriba.</p> : (
                <div className="tabla-wrap"><table><thead><tr><th>Cliente</th><th>¿Qué compró?</th><th>Tipo</th><th>Total</th><th>Fecha</th><th></th></tr></thead>
                <tbody>{clientesFiltrados.map((c) => (
                  <tr key={c.id}><td><b>{c.nombre}</b></td><td>{c.compra}</td><td>{c.tipo}</td><td>${c.total}</td><td>{c.fecha ? c.fecha.slice(0, 10) : ''}</td><td><button onClick={() => eliminarCliente(c.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button></td></tr>
                ))}</tbody></table></div>
              )}
              <p style={{ fontSize: 13, color: '#888' }}>Total clientes registrados: <b>{clientes.length}</b></p>
            </>
          )}

          {tabConsulta === 'pocoStock' && (
            pocoStock.length === 0 ? <p>✅ Todo bien, no hay productos con poco stock.</p> : (
              <div className="tabla-wrap"><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead>
              <tbody>{pocoStock.map(a => (
                <tr key={a.id}><td><b>{a.nombre}</b></td><td>{a.tipo}</td><td>${Number(a.precio).toLocaleString()}</td><td>{a.stock}</td><td style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Hay que pedir más</td></tr>
              ))}</tbody></table></div>
            )
          )}
        </div>
      </section>

      <section id="tabla" className="seccion-tabla" style={{ marginTop: 25 }}>
        <div className="tabla-header">
          <div><h2>📋 Productos registrados</h2><p>Total: <b>{aceites.length}</b> | Stock: <b>{totalStock}</b></p></div>
          <a href="#registro" className="btn-ir-registrar">➕ Registrar nuevo</a>
        </div>
        {aceites.length === 0 ? <p className="vacio">No hay aceites todavía.</p> : (
          <div className="tabla-wrap"><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>Descripción</th><th>Acciones</th></tr></thead>
          <tbody>{aceites.map(a => (
            <tr key={a.id}><td><b>{a.nombre}</b></td><td><span className="chip">{a.tipo}</span></td><td><b>${Number(a.precio).toLocaleString()}</b></td><td>{a.stock}{Number(a.stock) <= 5 && <div className="baja">⚠️ Existencia baja</div>}</td><td className="desc-tabla">{a.descripcion || 'Sin descripción'}</td><td><button className="btn-borrar-mini" onClick={() => eliminar(a.id)}>🗑️</button></td></tr>
          ))}</tbody></table></div>
        )}
      </section>

      <div className="container" id="registro">
        <aside className="card form-card">
          <h2>➕ Registrar Nuevo Aceite</h2>
          <form onSubmit={guardar}>
            <label>Nombre del producto</label>
            <input placeholder="Ej: Aceite 5W-30 Sintético" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option>Sintético</option><option>Mineral</option><option>Semi-Sintético</option><option>Esencial</option><option>Automotriz</option>
            </select>
            <div className="row">
              <div><label>Precio ($)</label><input type="number" placeholder="250" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required /></div>
              <div><label>Stock</label><input type="number" placeholder="10" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required /></div>
            </div>
            <label>Descripción</label>
            <textarea placeholder="Para motor gasolina, alto rendimiento..." value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            <button className="btn-guardar">💾 Guardar en Base de Datos</button>
          </form>
        </aside>

        <main id="catalogo">
          <div className="toolbar">
            <input className="buscador" placeholder="🔍 Buscar aceite..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div className="filtros">
              {['Todos','Sintético','Mineral','Esencial','Automotriz'].map(t => (
                <button key={t} className={filtro===t?'active':''} onClick={()=>setFiltro(t)}>{t}</button>
              ))}
            </div>
          </div>
          <h2 className="titulo-catalogo">Catálogo de Productos <span>({filtrados.length})</span></h2>
          {filtrados.length === 0 ? <p className="vacio">No hay aceites todavía.</p> : (
            <div className="grid">
              {filtrados.map((a, i) => (
                <div className="producto" key={a.id}>
                  <div className="img-wrap">
                    <img src={IMAGENES[i % IMAGENES.length]} alt={a.nombre} />
                    <span className="etiqueta">{a.tipo}</span>
                    {Number(a.stock) <= 5 && <span className="alerta">⚠ Poco stock</span>}
                  </div>
                  <div className="p-body">
                    <h3>{a.nombre}</h3>
                    <p className="desc">{a.descripcion || 'Sin descripción'}</p>
                    <div className="precio-row">
                      <span className="precio">${Number(a.precio).toLocaleString()}</span>
                      <span className={Number(a.stock)>0 ? 'stock-ok' : 'stock-no'}>● {a.stock} disponibles</span>
                    </div>
                    <div className="acciones">
                      <button className="btn-comprar" onClick={() => agregarAlPedido(a)}>🛒 Agregar</button>
                      <button className="btn-borrar" onClick={()=>eliminar(a.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <section id="contacto" className="seccion-tabla" style={{ marginBottom: 30 }}>
        <div style={{ background: '#4A2C1A', color: 'white', padding: 25, borderRadius: 15, display: 'flex', gap: 25, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0 }}>📞 Contacto</h2>
            <p>📍 Tula, Hidalgo, México</p>
            <p>📞 773-123-4567 | ✉️ ventas@ecoaceites.mx</p>
            <p>🕐 Lunes a Sábado: 9am - 7pm</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px' }}>¿Tienes dudas?</h3>
            <p style={{ margin: 0 }}>Escríbenos por WhatsApp y te atendemos<br/>en menos de 10 minutos.</p>
            <button style={{ marginTop: 12, background: '#25D366', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 20, fontWeight: 800, cursor: 'pointer' }}>💬 WhatsApp</button>
          </div>
        </div>
      </section>

      <footer>© 2026 EcoAceites & Lubricantes S.A. - Tula, Hidalgo | Hecho con React + Node + MySQL</footer>
    </div>
  );
}

export default App;