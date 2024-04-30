const { Pool } = require("pg");
const format = require('pg-format');
const { off } = require("process");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const obtenerInventario = async ({limits = 12, order_by = "id_ASC", page = 1}) => {
    
    const [ campo, direccion ] = order_by.split("_")
    const offset = (page-1) * limits
    const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
    
    try {
        const { rows: inventario } = await pool.query(formattedQuery)
        return inventario
    } catch (error) {
        console.error("error executing query", error);
        throw error;
    }
    
}

const obtenerInventarioFiltrado = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = [];
    const values = [];

    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor);
        //const { length } = filtros;
        filtros.push(`${campo} ${comparador} $${filtros.length + 1}`);
    };

    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);

    let consulta = "SELECT * FROM inventario";

    if (filtros.length > 0) {
        filtros = filtros.join(" AND ");
        consulta += ` WHERE ${filtros}`;
    }
    try {
        const { rows: inventario } = await pool.query(consulta, values);
        return inventario;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

const prepararHATEOAS = (joyas) => {
    const results = joyas.map((j) => {
    return {
    name: j.nombre,
    href: `/joyas/joya/${j.id}`,
    }
    }).slice(0, 12)
    const total = joyas.length
    const HATEOAS = {
    total,
    results
    }
    return HATEOAS
    }

const generarReporte = (req, res, next) => {
        const { method, url } = req;
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${method} request to ${url}`;
        console.log(logMessage);
        next();
};
    

module.exports = { obtenerInventario, obtenerInventarioFiltrado, prepararHATEOAS, generarReporte}