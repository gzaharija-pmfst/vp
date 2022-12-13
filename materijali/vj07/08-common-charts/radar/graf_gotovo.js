async function crtajRadar() {

  // 1. Pristup podacima

  let dataset = await d3.json("../vrijeme.json")
  console.log(dataset)

  const datumParser = d3.timeParse("%Y-%m-%d")
  const datumAccessor = d => datumParser(d.date)
  dataset = dataset.sort((a,b) => datumAccessor(a) - datumAccessor(b))
  const metrike = [
    "windBearing",
    "moonPhase",
    "pressure",
    "humidity",
    "windSpeed",
    "temperatureMax",
  ]

  // 2. Dimenzije grafa

  const sirina = 600
  let dimenzije = {
    sirina: sirina,
    visina: sirina,
    polumjer: sirina / 2,
    margine: {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    },
  }
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom
  dimenzije.grPolumjer = dimenzije.polumjer - ((dimenzije.margine.left + dimenzije.margine.right) / 2)

  // 3. Crtanje granica

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
      .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`)

  // 4. Create scales

  const razmjeriMetrika = metrike.map(metrika => (
    d3.scaleLinear()
    .domain(d3.extent(dataset, d => +d[metrika]))
    .range([0, dimenzije.grPolumjer])
    .nice()
  ))


  // 6. Draw peripherals
  // We're drawing our axes early here so they don't overlap our radar line

  const osi = granice.append("g")

  const radarKruznice = d3.range(4).map((d, i) => (
    osi.append("circle")
      .attr("cx", dimenzije.grPolumjer)
      .attr("cy", dimenzije.grPolumjer)
      .attr("r", dimenzije.grPolumjer * (i / 3))
      .attr("class", "radar-pravac")
  ))

  const rTd = rad => (rad * 180.0) / Math.PI;
  const dTr = deg => (deg * Math.PI) / 180.0;

  const radarPravci = metrike.map((matrika, i) => {
    let kut = i * ((Math.PI * 2) / metrike.length) - Math.PI * 0.5
    //console.log(rTd(kut))
    //kut = dTr(0) 
    console.log("COS", Math.cos(kut))
    console.log("SIN", Math.sin(kut))
    return osi.append("line")
      .attr("x1", dimenzije.grSirina / 2)
      .attr("x2", Math.cos(kut) * dimenzije.grPolumjer + dimenzije.grSirina / 2)
      .attr("y1", dimenzije.grVisina / 2)
      .attr("y2", Math.sin(kut) * dimenzije.grPolumjer + dimenzije.grSirina / 2)
      .attr("class", "radar-pravac")
  })

  const oznake = metrike.map((metrika, i) => {
    const kut = i * ((Math.PI * 2) / metrike.length) - Math.PI * 0.5
    const x = Math.cos(kut) * (dimenzije.grPolumjer * 1.1) + dimenzije.grSirina / 2
    const y = Math.sin(kut) * (dimenzije.grPolumjer * 1.1) + dimenzije.grVisina / 2
    return osi.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("class", "ime-metrike")
      .style("text-anchor",
        i == 0 || i == metrike.length / 2 ? "middle" :
        i < metrike.length / 2            ? "start"  :
                                            "end"

      )
      .text(metrika)
    })

  // 5. Crtanje podataka

  const pravac = granice.append("path")
      .attr("class", "pravac")

  const crtajPravac = (dan) => {
    const generatorPravca = d3.lineRadial()
        .angle((metrika, i) => i * ((Math.PI * 2) / metrike.length))
        .radius((metrika, i) => razmjeriMetrika[i](+dan[metrika] || 0))
        .curve(d3.curveLinearClosed)

    const pravac = granice.select(".pravac")
        .datum(metrike)
        .attr("d", generatorPravca)
        .style("transform", `translate(${dimenzije.grPolumjer}px, ${dimenzije.grPolumjer}px)`)

  }

  let indeksAktivnogDana = 0
  const naslov = d3.select("#naslov")
  const formatDatuma = d3.timeFormat("%B %-d, %Y")

  const osvjeziGraf = () => {
    naslov.text(formatDatuma(datumAccessor(dataset[indeksAktivnogDana])))
    crtajPravac(dataset[indeksAktivnogDana])
  }

  osvjeziGraf()

  d3.select("#iduci-dan").on("click", e => {
    indeksAktivnogDana = (indeksAktivnogDana + 1) % dataset.length
    osvjeziGraf()
  })
}
crtajRadar()