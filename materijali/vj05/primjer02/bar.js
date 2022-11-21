async function crtajBar() {

  // 1. Pristup podacima

  const dataset = await d3.json("../vrijeme.json")

  // 2. Dimenzije grafa

  const sirina = 600
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
  dimenzije.boundedWidth = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.boundedHeight = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje canvas-a

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
      .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`)

  // staticki elementi
  granice.append("g")
      .attr("class", "kosare")
  granice.append("line")
      .attr("class", "prosjek")
  granice.append("g")
      .attr("class", "x-os")
      .style("transform", `translateY(${dimenzije.boundedHeight}px)`)
    .append("text")
      .attr("class", "x-os-oznaka")

  const mjeraAccessor = d => d.humidity
  const yAccessor = d => d.length

  // 4. Definiranje razmjera

  const xSkala = d3.scaleLinear()
    .domain(d3.extent(dataset, mjeraAccessor))
    .range([0, dimenzije.boundedWidth])
    .nice()

  const kosGenerator = d3.histogram()
    .domain(xSkala.domain())
    .value(mjeraAccessor)
    .thresholds(12)

  const kosare = kosGenerator(dataset)

  const ySkala = d3.scaleLinear()
    .domain([0, d3.max(kosare, yAccessor)])
    .range([dimenzije.boundedHeight, 0])
    .nice()

  // 5. Crtanje podataka

  const barPadding = 1

  let sveKosare = granice.select(".kosare")
    .selectAll(".kosara")
    .data(kosare)

  sveKosare.exit()
      .remove()

  const noveKosare = sveKosare.enter().append("g")
      .attr("class", "kosara")

  noveKosare.append("rect")
  noveKosare.append("text")

  // spajamo nove kosare sa postojecim
  sveKosare = noveKosare.merge(sveKosare)

  const stupciGrafa = sveKosare.select("rect")
      .attr("x", d => xSkala(d.x0) + barPadding)
      .attr("y", d => ySkala(yAccessor(d)))
      .attr("height", d => dimenzije.boundedHeight - ySkala(yAccessor(d)))
      .attr("width", d => d3.max([
        0,
        xSkala(d.x1) - xSkala(d.x0) - barPadding
      ]))

  const srVr = d3.mean(dataset, mjeraAccessor)

  const prosjekLinija = granice.selectAll(".prosjek")
      .attr("x1", xSkala(srVr))
      .attr("x2", xSkala(srVr))
      .attr("y1", -20)
      .attr("y2", dimenzije.boundedHeight)

  // crtanje osi
  const xOsGenerator = d3.axisBottom()
    .scale(xSkala)

  const xOs = granice.select(".x-os")
    .call(xOsGenerator)


  const xOsOznaka = xOs.select(".x-os-oznaka")
      .attr("x", dimenzije.boundedWidth / 2)
      .attr("y", dimenzije.margine.bottom - 10)
      .text("Vlažnost")

  // 7. Interakcije
  sveKosare.select("rect")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)

  const detalji = d3.select("#detalji")
  const vlFormat = d3.format(".2f")

  function onMouseEnter(event, podatak) {  
    
    const x = xSkala(podatak.x0)
      + (xSkala(podatak.x1) - xSkala(podatak.x0)) / 2
      + dimenzije.margine.left

    const y = ySkala(yAccessor(podatak))
      + dimenzije.margine.top

    detalji.style("transform", 
      `translate(
        calc(-50% + ${x}px), 
        calc(-100% + ${y}px)
      )`)

    
    detalji.select("#brojac")
      .text(yAccessor(podatak))
    detalji.select("#raspon")
      .text([
        vlFormat(podatak.x0), vlFormat(podatak.x1)
      ].join(" - "))

      detalji.style("opacity", 1)
  }

  function onMouseLeave(){
    detalji.style("opacity", 0)
  }

}
crtajBar()