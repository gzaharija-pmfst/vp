async function crtajHeat() {

  // 1. Pristup podacima
  let dataset = await d3.json("../vrijeme.json")
  console.log(dataset)
  
  const datumParser = d3.timeParse("%Y-%m-%d")
  const datumAccessor = d => datumParser(d.date)
  dataset = dataset.sort((a,b) => datumAccessor(a) - datumAccessor(b))

  const prviDatum = datumAccessor(dataset[0])
  const formatTjedan = d3.timeFormat("%-e") //%e - space-padded day of the month as a decimal number [ 1,31]; equivalent to %_d.
  const xAccessor = d => d3.timeWeeks(prviDatum, datumAccessor(d)).length
  const formatDan = d3.timeFormat("%-u") // %u - Monday-based (ISO 8601) weekday as a decimal number [1,7].
  const yAccessor = d => +formatDan(datumAccessor(d)) - 1


  // 2. Dimenzije grafa

  const brojTjedana = Math.ceil(dataset.length / 7) + 1
  let dimenzije = {
    margine: {
      top: 30,
      right: 0,
      bottom: 0,
      left: 80,
    },
  }
  dimenzije.sirina = (window.innerWidth - dimenzije.margine.left - dimenzije.margine.right) * 0.95
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.visina = dimenzije.grSirina * 7 / brojTjedana + dimenzije.margine.top + dimenzije.margine.bottom
  dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje prostora grafa

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
    .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`)

  // 4. Definiranje razmjera

  const paddingStupca = 0
  const ukupnaDimStupca = d3.min([
    dimenzije.grSirina / brojTjedana,
    dimenzije.grVisina / 7,
  ])
  const dimenzijaStupca = ukupnaDimStupca - paddingStupca

  // 5. Iscrtavanje podataka

  const formatMjesec = d3.timeFormat("%b")  // %b - abbreviated month name
  const mjeseci = granice.selectAll(".mjesec")
    .data(d3.timeMonths(datumAccessor(dataset[0]), datumAccessor(dataset[dataset.length - 1])))
    .enter().append("text")
      .attr("class", "mjesec")
      .attr("transform", d => `translate(${ukupnaDimStupca * d3.timeWeeks(prviDatum, d).length}, -10)`)
      .text(d => formatMjesec(d))

  const parsirajDanTjedna = d3.timeParse("%-e")
  const formatOznakeDana = d3.timeFormat("%-A")
  const oznake = granice.selectAll(".oznaka")
    .data(new Array(7).fill(null).map((d,i) => i))
    .enter().append("text")
      .attr("class", "oznaka")
      .attr("transform", d => `translate(-10, ${ukupnaDimStupca * (d + 0.5)})`)
      .text(d => console.log(d))
    console.log(formatOznakeDana(parsirajDanTjedna(0)))


  const crtajDane = (metrika) => {
    d3.select("#metrika")
      .text(metrika)
    const bojaAccessor = d => d[metrika]
    const domenaBoje = d3.extent(dataset, bojaAccessor)
    const rasponBoje = d3.scaleLinear()
      .domain(domenaBoje)
      .range([0, 1])
      .clamp(true)
    const gradijentBoje = d3.interpolateHcl("#ecf0f1", "#5758BB")
    const skalaBoje = d => gradijentBoje(rasponBoje(d) || 0)

    d3.select("#legenda-min")
      .text(domenaBoje[0])
    d3.select("#legenda-max")
      .text(domenaBoje[1])
    d3.select("#legenda-gradijent")
      .style("background", `linear-gradient(to right, ${
        new Array(10).fill(null).map((d, i) => (
          `${gradijentBoje(i / 9)} ${i * 100 / 9}%`
        )).join(", ")
      })`)

    const dani = granice.selectAll(".day")
      .data(dataset, datumAccessor)

    const noviDani = dani.enter().append("rect")

    const sviDani = noviDani.merge(dani)
        .attr("class", "day")
        .attr("x", d => ukupnaDimStupca * xAccessor(d))
        .attr("width", dimenzijaStupca)
        .attr("y", d => ukupnaDimStupca * yAccessor(d))
        .attr("height", dimenzijaStupca)
        .style("fill", d => skalaBoje(bojaAccessor(d)))

    const stariDani = dani.exit()
        .remove()
  }

  const metrike = [
    "moonPhase",
    "windSpeed",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ]
  let indexMetrike = 0
  crtajDane(metrike[indexMetrike])

  const button = d3.select("#zaglavlje")
    .append("button")
      .text("Iduća metrika")

  button.node().addEventListener("click", onClick)
  function onClick() {
    indexMetrike = (indexMetrike + 1) % metrike.length
    crtajDane(metrike[indexMetrike])
  }
}
crtajHeat()