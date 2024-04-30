const express = require('express')
const app = express()
app.listen(3000, console.log('Server ON'))

const { obtenerInventario, obtenerInventarioFiltrado, prepararHATEOAS, generarReporte } = require('./consultas')

app.use(generarReporte);

app.get("/joyas", async (req, res) => {
    const queryStrings = req.query
    const joyas = await obtenerInventario(queryStrings)
    const HATEOAS = await prepararHATEOAS(joyas)
    res.json(HATEOAS)
} )

app.get('/joyas/filtros', async (req,res) => {
    const queryStrings = req.query
    const joyas = await obtenerInventarioFiltrado(queryStrings)
    //const HATEOAS = await prepararHATEOAS(joyas)
    res.json(joyas)
})