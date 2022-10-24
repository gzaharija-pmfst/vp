async function crtajScatter() {
  // ovdje pisemo kôd vježbe
  let dataset = await d3.json("vrijeme.json");
  console.log(dataset[0]);

  const xAccessor = (data) => (data.dewPoint - 32) * 0.5556;
  //const xAccessor = data => data.dewPoint;
  const yAccessor = (data) => data.humidity;

  const sirina = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

  let dimenzije = {
    sirina: sirina,
    visina: sirina,
    margine: {
      top: 10,
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

  const granice = okvir.append("g").style(
    "transform",
    `translate(
      ${dimenzije.margine.left}px, 
      ${dimenzije.margine.top}px
    )`
  );

  const xSkala = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimenzije.grSirina])
    .nice();

  console.log(xSkala.domain());

  const ySkala = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimenzije.grVisina, 0])
    .nice();

  console.log(ySkala.domain());

  /*   granice.append("circle")
    .attr("cx", dimenzije.grSirina / 2)
    .attr("cy", dimenzije.grVisina / 2)
    .attr("r", 5) */

  /*     dataset.forEach(dp => {
      granice
        .append("circle")
        .attr("cx", xSkala(xAccessor(dp)))
        .attr("cy", ySkala(yAccessor(dp)))
        .attr("r", 3);
    }); */

  const tocke = granice
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (dp) => xSkala(xAccessor(dp)))
    .attr("cy", (dp) => ySkala(yAccessor(dp)))
    .attr("r", 3)
    .attr("fill", "#6495ed");

  console.log(tocke);

  /*     const crtajTocke = (podaci, boja) => {
      const tocke = granice.selectAll("circle").data(podaci)
      
      tocke.join("circle")    
      .attr("cx", d => xSkala(xAccessor(d)))
      .attr("cy", d => ySkala(yAccessor(d)))
      .attr("r", 4)
        .attr("fill", boja)
    }

    crtajTocke(dataset.slice(0,200), "darkgrey")

    setTimeout( ()=> {
      crtajTocke(dataset, "blue")
    }, 1000) */

  const xOsGen = d3.axisBottom().scale(xSkala);
  const xOs = granice
    .append("g")
    .call(xOsGen)
      .style("transform", 
      `translateY(${dimenzije.grVisina}px)`);
  
  const xOsOznaka = xOs.append("text")
    .attr("x", dimenzije.grSirina / 2)
    .attr("y", dimenzije.margine.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "1.5em")
    .html("Temperatura rosišta (&deg;C)")

  const yOsGen = d3.axisLeft()
    .scale(ySkala)
    .ticks(4)
  const yOs = granice.append("g")
    .call(yOsGen)

  const yOsOznaka = yOs.append("text")
    .attr("x", -dimenzije.grVisina / 2)
    .attr("y", -dimenzije.margine.left + 15)
    .attr("fill", "black")
    .style("font-size", "1.5em")
    .html("Relativna vlažnost")
    .style("transform", "rotate(-90deg)")
    .style("text-anchor", "middle")
}
crtajScatter();
