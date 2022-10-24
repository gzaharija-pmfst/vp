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

  const kosGenerator = d3
    .histogram()
    .domain(xSkala.domain())
    .value(xAccessor)
    .thresholds(12);

  const kosare = kosGenerator(dataset);
  console.log(kosare);

  const ySkala = d3
    .scaleLinear()
    .domain([0, d3.max(kosare, yAccessor)])
    .range([dimenzije.grVisina, 0])
    .nice();

  const sveKosare = granice.append("g");

  const kosGrupe = sveKosare.selectAll("g").data(kosare).enter().append("g");

  const barPadding = 1;
  const barCrtez = kosGrupe.append("rect")
    .attr("x", dp => xSkala(dp.x0) + barPadding / 2)
    .attr("y", dp => ySkala(yAccessor(dp)))
    .attr("width", dp => (xSkala(dp.x1) - xSkala(dp.x0) - barPadding))
    .attr("height", dp => dimenzije.grVisina - ySkala(yAccessor(dp)))
    .attr("fill", "#0877ee");
}
crtajBarChart();
