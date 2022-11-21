async function crtajLinijski() {

  // 1. Pristup podacima

  let dataset = await d3.json("../vrijeme.json")

  const yAccessor = d => (d.temperatureMax - 32) * 0.5556
  const datumParser = d3.timeParse("%Y-%m-%d")
  const xAccessor = d => datumParser(d.date)
  dataset = dataset.sort((a,b) => xAccessor(a) - xAccessor(b)).slice(0, 100)


  // 2. Dimenzije grafa

  let dimenzije = {
    sirina: window.innerWidth * 0.9,
    visina: 400,
    margine: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje canvasa

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
      .attr("transform", 
        `translate(${dimenzije.margine.left},${dimenzije.margine.top})`
      )

  granice.append("defs").append("clipPutanja")
      .attr("id", "granice-clip-putanje")
    .append("rect")
      .attr("width", dimenzije.grSirina)
      .attr("height", dimenzije.grVisina)

  const clip = granice.append("g")
    .attr("clip-path", "url(#granice-clip-putanje)")

  // 4. Definiranje razmjera

  const ySkala = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimenzije.grVisina, 0])

  const pozicijaTempSmrz = ySkala(0)
  const tempSmrz = clip.append("rect")
      .attr("class", "led")
      .attr("x", 0)
      .attr("width", d3.max([0, dimenzije.grSirina]))
      .attr("y", pozicijaTempSmrz)
      .attr("height", d3.max([0, dimenzije.grVisina - pozicijaTempSmrz]))

  const xSkala = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimenzije.grSirina])

  // 5. Crtanje podataka

  const generatorLinije = d3.line()
    .x(d => xSkala(xAccessor(d)))
    .y(d => ySkala(yAccessor(d)))

  const linija = clip.append("path")
      .attr("class", "linija")
      .attr("d", generatorLinije(dataset))

  // 6. Crtanje pomocne grafike

  const yOsGenerator = d3.axisLeft()
    .scale(ySkala)

  const yOs = granice.append("g")
      .attr("class", "y-os")
    .call(yOsGenerator)

  const yAxisLabel = yOs.append("text")
      .attr("class", "y-os-oznaka")
      .attr("x", -dimenzije.grVisina / 2)
      .attr("y", -dimenzije.margine.left + 10)
      .html("Min. temperatura (&deg;C)")

  const xOsGenerator = d3.axisBottom()
    .scale(xSkala)

  const xOs = granice.append("g")
      .attr("class", "x-os")
      .style("transform", `translateY(${dimenzije.grVisina}px)`)
    .call(xOsGenerator)

  // 7. Postavljanje interakcije

}
crtajLinijski()
