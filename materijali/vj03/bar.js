async function crtajBarChart() {
  // ovdje ide kôd
  const dataset = await d3.json("vrijeme.json");

  const xAccessor = d => d.humidity;
  const yAccessor = d => d.length;

  const sirina = 600;
  let dimenzije = {
    sirina: sirina,
    visina: sirina * 0.6,
    margine: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };
  dimenzije.grSirina =
    dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right;
  dimenzije.grVisina =
    dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom;

  const okvir = d3
    .select("#okvir")
    .append("svg")
    .attr("width", dimenzije.sirina)
    .attr("height", dimenzije.visina);

  const granice = okvir
    .append("g")
    .style(
      "transform",
      `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`
    );

  const xSkala = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimenzije.grSirina])
    .nice();

  const kosGenerator = d3.histogram()
    .domain(xSkala.domain())
    .value(xAccessor)
    .thresholds(15);

  const kosare = kosGenerator(dataset);
  

  const ySkala = d3.scaleLinear()
    .domain([0, d3.max(kosare, yAccessor)])
    .range([dimenzije.grVisina, 0])
    .nice();

  const sveKosare = granice.append("g");
  console.log(sveKosare);

  const kosGrupe = sveKosare.selectAll("g")
  .data(kosare).enter().append("g")
  
  console.log(kosGrupe)

  const barPadding = 1;
  const barCrtez = kosGrupe.append("rect")
    .attr("x", dp => xSkala(dp.x0))
    .attr("y", dp => ySkala(yAccessor(dp)))
    .attr("width", dp => (xSkala(dp.x1) - xSkala(dp.x0)) - barPadding)
    .attr("height", dp => dimenzije.grVisina - ySkala(yAccessor(dp)))
    .attr("fill", "#0877ee");

    const barTekst = kosGrupe.filter(yAccessor)
    .append("text")
      .attr("x", dp => xSkala(dp.x0) + (xSkala(dp.x1) - xSkala(dp.x0)) / 2)
      .attr("y", dp => ySkala(yAccessor(dp)) - 5)
      .text(yAccessor)
      .style("text-anchor", "middle")
      .attr("fill", "darkgrey")
      .style("font-size", "12px")
    
    const srVr = d3.mean(dataset, xAccessor)
    console.log(srVr)

    const srednjaPravac = granice.append("line")
    .attr("x1", xSkala(srVr))
    .attr("x2", xSkala(srVr))
    .attr("y1", -15)
    .attr("y2", dimenzije.grVisina)
    .attr("stroke", "maroon")
    .attr("stroke-dasharray", "2px 4px")

    const srednjaOznaka = granice.append("text")
    .attr("x", xSkala(srVr))
    .attr("y", -20)
    .text("srednja vrijednost")
    .attr("fill", "maroon")
    .style("font-size", "12px")
    .style("text-anchor", "middle")

    const xOsGenerator = d3.axisBottom()
    .scale(xSkala)

  const xOs = granice.append("g")
    .call(xOsGenerator)
      .style("transform", `translateY(${dimenzije.grVisina}px)`)

  const xOsOznaka = xOs.append("text")
      .attr("x", dimenzije.grSirina / 2)
      .attr("y", dimenzije.margine.bottom - 10)
      .attr("fill", "black")
      .style("font-size", "1.4em")
      .text("Vlažnost zraka")

}
crtajBarChart();
