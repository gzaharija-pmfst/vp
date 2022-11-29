async function crtajMapu() {
  // your code goes here
  const oblikDrzava = await d3.json('../world-geojson.json')



  const imeDrzaveAccessor = d => d.properties["NAME"]
  const idDrzaveAccessor = d => d.properties["ADM0_A3_IS"]

  const dataset = await d3.csv("../data_bank_data.csv")


  const metrika = "Population growth (annual %)"

  let metrikaPoDrzavi = {}

  dataset.forEach(d => {
    if (d["Series Name"] != metrika)
      return
    metrikaPoDrzavi[d["Country Code"]] = d["2017 [YR2017]"] || 0
  })

  console.log(metrikaPoDrzavi)


  let dimenzije = {
    sirina: window.innerWidth * 0.9,
    margine: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  }
  dimenzije.grSirina = dimenzije.sirina
    - dimenzije.margine.left
    - dimenzije.margine.right

  const sfera = ({type: "Sphere"})

  const projekcija = d3.geoEqualEarth()
    .fitWidth(dimenzije.grSirina, sfera) 
  

  const putanjaGenerator = d3.geoPath(projekcija)





  const [[x0, y0], [x1, y1]] = putanjaGenerator.bounds(sfera)
  dimenzije.grVisina = y1;
  dimenzije.visina = dimenzije.grVisina + dimenzije.margine.top + dimenzije.margine.bottom

  const okvir = d3.select("#okvir")
    .append("svg")
    .attr("width", dimenzije.sirina)
    .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
    .style("transform", 
    `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`
    )

  const vrijednosti = Object.values(metrikaPoDrzavi)

  const graniceVrijednosti = d3.extent(vrijednosti)
  console.log(graniceVrijednosti)

  const maxPromjena = d3.max([-graniceVrijednosti[0], graniceVrijednosti[1]])
  console.log(maxPromjena)
  const skalaBoja = d3.scaleLinear()
    .domain([-maxPromjena, 0, maxPromjena])
    .range(["indigo", "white", "darkgreen"])

  // CRTANJE
  const zemlja = granice.append("path")
    .attr("class", "zemlja")
    .attr("d", putanjaGenerator(sfera))

  const mrezaJson = d3.geoGraticule10()

  const mreza = granice.append("path")
    .attr("class", "mreza")
    .attr("d", putanjaGenerator(mrezaJson))

  const drzave = granice.selectAll(".drzava")
    .data(oblikDrzava.features)
    .enter().append("path")
      .attr("class", "drzava")
      .attr("d", putanjaGenerator)
      .attr("fill", d => {
        const vr = metrikaPoDrzavi[idDrzaveAccessor(d)]
        if (typeof vr == "undefined") return "#e3e6e9"
        return skalaBoja(vr)
      })

  const legendaGrupa = okvir.append("g")
  .attr("transform", `translate(120,${
    dimenzije.sirina < 800
    ? dimenzije.grVisina - 30
    : dimenzije.grVisina * 0.5
  })`)

  const legendaNaslov = legendaGrupa.append("text")
    .attr("y", -23)
    .attr("class", "legenda-naslov")
    .text("Rast populacije")

  const legandaOpis = legendaGrupa.append("text")
    .attr("y", -9)
    .attr("class", "legenda-opis")
    .text("Postotak promjene u 2017.")

    console.log(skalaBoja.range())

    const defs = okvir.append("defs")
    const legNijansaId = "legenda-nijansa"
    const gradijent = defs.append("linearGradient")
      .attr("id", legNijansaId)
      .selectAll("stop")
      .data(skalaBoja.range())
      .enter().append("stop")
        .attr("stop-color", d => d)
        .attr("offset", (d, i) => `${i * 50}%`)
  
    const legednaSirina = 120
    const legendaVisina = 16
    const legendaNijansa = legendaGrupa.append("rect")
        .attr("x", -legednaSirina / 2)
        .attr("height", legendaVisina)
        .attr("width", legednaSirina)
        .style("fill", `url(#${legNijansaId})`)
  
    const legendaVrD = legendaGrupa.append("text")
        .attr("class", "legenda-vrijednost")
        .attr("x", legednaSirina / 2 + 10)
        .attr("y", legendaVisina / 2)
        .text(`${d3.format(".1f")(maxPromjena)}%`)
  
    const legendaVrL = legendaGrupa.append("text")
        .attr("class", "legenda-vrijednost")
        .attr("x", -legednaSirina / 2 - 10)
        .attr("y", legendaVisina / 2)
        .text(`${d3.format(".1f")(-maxPromjena)}%`)
        .style("text-anchor", "end")

  // Interakcije
  drzave
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)

    const detalji = d3.select("#detalji")

  function onMouseEnter(e,d){
    console.log(d)
    detalji.style("opacity", 1)

    detalji.select("#drzava")
      .text(imeDrzaveAccessor(d))

    const formatP = d3.format(",.2f")
    const vrijednost = metrikaPoDrzavi[idDrzaveAccessor(d)]

    detalji.select("#vrijednost")
      .text(`${formatP(vrijednost || 0)}%`)

    const [centerX, centerY] = putanjaGenerator.centroid(d)
    const kruzic = granice.append("circle")
      .attr("class", "kruzic")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 3)

    
      detalji.style("transform", `translate(
        calc(-50% + ${centerX + dimenzije.margine.left}px),
        calc(-100% + ${centerY + dimenzije.margine.top}px)
      )`)
  }

  function onMouseLeave(e,d){
    detalji.style("opacity", 0)
    d3.selectAll(".kruzic").remove()
  }


}
crtajMapu()