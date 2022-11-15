async function drawBars() {

  // 1. Pristup podacima
  const dataset = await d3.json("../vrijeme.json");

  // 2. Definiranje dimenzija grafa

  const sirina = 500
  let dimenzije = {
    sirina: sirina,
    visina: sirina * 0.6,
    margine: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje povrsine grafa

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
      .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`)

  // staticki elementi grafa
  granice.append("g")
      .attr("class", "kosare")
  granice.append("line")
      .attr("class", "prosjek")
  granice.append("g")
      .attr("class", "x-os")
      .style("transform", `translateY(${dimenzije.grVisina}px)`)
    .append("text")
      .attr("class", "x-os-oznaka")
      .attr("x", dimenzije.grSirina / 2)
      .attr("y", dimenzije.margine.bottom - 10)

  const crtajHistogram = metrika => {
    const metrikaAccessor = d => d[metrika]
    const yAccessor = d => d.length

    // 4. Definiranje razmjera

    const xSkala = d3.scaleLinear()
      .domain(d3.extent(dataset, metrikaAccessor))
      .range([0, dimenzije.grSirina])
      .nice()

    const kosGenerator = d3.histogram()
      .domain(xSkala.domain())
      .value(metrikaAccessor)
      .thresholds(12)

    const kosare = kosGenerator(dataset)

    const ySkala = d3.scaleLinear()
      .domain([0, d3.max(kosare, yAccessor)])
      .range([dimenzije.grVisina, 0])
      .nice()

    // 5. Crtanje podataka

    const barPadding = 1

    const izlazTranzicija = d3.transition().duration(600)
    const novaTranzicija = izlazTranzicija.transition().duration(600)
      

    console.log(novaTranzicija)
    
    let sveKosare = granice.select(".kosare")
      .selectAll(".kosara")
      .data(kosare)

    const stareKosare = sveKosare.exit()
    stareKosare.selectAll("rect")
        .style("fill", "red")
      .transition(izlazTranzicija)
        .attr("y", dimenzije.grVisina)
        .attr("height", 0)
    
    stareKosare.selectAll("text")
      .transition(izlazTranzicija)
        .attr("y", dimenzije.grVisina)

    stareKosare
    .transition(izlazTranzicija)
      .remove() 

    const noveKosare = sveKosare.enter().append("g")
        .attr("class", "kosara")

    noveKosare.append("rect")
    .attr("x", d => xSkala(d.x0) + barPadding)
    .attr("y", dimenzije.grVisina)
    .attr("width", d => d3.max([0,xSkala(d.x1) - xSkala(d.x0) - barPadding]))
    .attr("height", 0)
    .style("fill", "yellowgreen")
    noveKosare.append("text")
        .attr("x", d => xSkala(d.x0) + (xSkala(d.x1) - xSkala(d.x0)) / 2)
        .attr("y", dimenzije.grVisina)

    sveKosare = noveKosare.merge(sveKosare)

    // osvjezavamo kosare za prikaz novih podataka    

    const stupciGrafa = sveKosare.select("rect")
      .transition(novaTranzicija)
        .attr("x", d => xSkala(d.x0) + barPadding)
        .attr("y", d => ySkala(yAccessor(d)))
        .attr("width", d => d3.max([0,xSkala(d.x1) - xSkala(d.x0) - barPadding]))
        .attr("height", d => dimenzije.grVisina - ySkala(yAccessor(d)))
      .transition()
        .style("fill", "cornflowerblue")

    console.log(stupciGrafa)

    const stupacTekst = sveKosare.select("text")
      .transition(novaTranzicija)
        .attr("x", d => xSkala(d.x0) + (xSkala(d.x1) - xSkala(d.x0)) / 2)
        .attr("y", d => ySkala(yAccessor(d)) - 5)
        .text(d => yAccessor(d) || "")

    const srVr = d3.mean(dataset, metrikaAccessor)

    const srednjaPravac = granice.selectAll(".prosjek")
      .transition(novaTranzicija)
        .attr("x1", xSkala(srVr))
        .attr("x2", xSkala(srVr))
        .attr("y1", -20)
        .attr("y2", dimenzije.grVisina)

    // 6. Crtanje pomocne grafike

    const xOsGenerator = d3.axisBottom()
      .scale(xSkala)

    const xOs = granice.select(".x-os")
      .transition(novaTranzicija)
      .call(xOsGenerator)

    const xOsOznaka = xOs.select(".x-os-oznaka")
        .text(metrika)
  }
  // KRAJ FUNKCIJE CRTAJHISTOGRAM
  const metrike = [
    "windSpeed",
    "moonPhase",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ]
  let indexOdabraneMetrike = 0
  crtajHistogram(metrike[indexOdabraneMetrike])

  const button = d3.select("body")
    .append("button")
      .text("Iduća metrika")
  
  button.node().addEventListener("click", onClick)
  function onClick() {
    indexOdabraneMetrike = (indexOdabraneMetrike + 1) % metrike.length
    crtajHistogram(metrike[indexOdabraneMetrike])
  }
}
drawBars()