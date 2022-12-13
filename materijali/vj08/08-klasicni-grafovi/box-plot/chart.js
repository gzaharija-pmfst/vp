async function crtajBox() {

  // 1. Pristup podacima
  const dataset = await d3.json("../vrijeme.json")

  const datumParser = d3.timeParse("%Y-%m-%d")
  const brojMjeseca = d3.timeFormat("%m")

  const podaciPoMjesecu = d3.groups(dataset, d => brojMjeseca(datumParser(d.date)))
  console.log(podaciPoMjesecu)

  const yAccessor = d => (d.temperatureMax - 32) * 0.5556;
  const mjesecAccessor = d => d.mjesec

  const poMjesecuProsireno = podaciPoMjesecu.map(mjesec => {
    const mjesecSve = mjesec[1].map(yAccessor).sort((a,b) => a - b)
    const q1 = d3.quantile(mjesecSve, 0.25)
    const median = d3.median(mjesecSve)
    const q3 = d3.quantile(mjesecSve, 0.75)
    const iqr = q3 - q1
    const [min, max] = d3.extent(mjesecSve) 
    const rasponMin = d3.max([min, q1 - iqr * 1.5])
    const rasponMax = d3.min([max, q3 + iqr * 1.5])
    const outliers = mjesec[1].filter(d => yAccessor(d) < rasponMin || yAccessor(d) > rasponMax)

    return {
      ...mjesec,
      mjesec: +mjesec[0],
      q1, median, q3, iqr, min, max, rasponMin: rasponMin, rasponMax: rasponMax, outliers
    }
  })

  console.log(poMjesecuProsireno)

  // 2. Dimenzije grafa

  const sirina = 800
  let dimenzije = {
    sirina: sirina,
    visina: sirina * 0.6,
    margine: {
      top: 30,
      right: 10,
      bottom: 30,
      left: 50,
    },
  }
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje grafa

  const okvir = d3.select("#okvir")
    .append("svg")
      .attr("width", dimenzije.sirina)
      .attr("height", dimenzije.visina)

  const granice = okvir.append("g")
      .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`)

  // 4. Definiranje razmjera

  const xSkala = d3.scaleLinear()
    .domain([1, podaciPoMjesecu.length + 1])
    .rangeRound([0, dimenzije.grSirina])
    .nice()

  const ySkala = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimenzije.grVisina, 0])
    .nice()    
  

  const generatorGrupa = d3.bin()
    .value(mjesecAccessor)
    .thresholds(podaciPoMjesecu.length)

  const grupe = generatorGrupa(poMjesecuProsireno)


 

  // 5. Iscrtavanje podataka

  const paddingStupci = 7

  let sviStupci = granice.selectAll(".bin")
    .data(grupe)

  sviStupci.exit()
      .remove()

  const noviStupci = sviStupci.enter().append("g")
      .attr("class", "bin")

  sviStupci = noviStupci.merge(sviStupci)
  console.log(sviStupci)

  const sirinaStupca = bar => xSkala(bar.x1) - xSkala(bar.x0)
  const rasponLinije = sviStupci.append("line")
      .attr("class", "linija")
      .attr("x1", d => xSkala(d.x0) + sirinaStupca(d) / 2)
      .attr("x2", d => xSkala(d.x0) + sirinaStupca(d) / 2)
      .attr("y1", d => ySkala(d[0].rasponMin))
      .attr("y2", d => ySkala(d[0].rasponMax))

  const kutije = sviStupci.append("rect")
      .attr("x", d => xSkala(d.x0) + paddingStupci / 2)
      .attr("y", d => ySkala(d[0].q3))
      .attr("width", d => sirinaStupca(d) - paddingStupci)
      .attr("height", d => ySkala(d[0].q1) - ySkala(d[0].q3))

    const medijani = sviStupci.append("line")
      .attr("class", "medijan")
      .attr("x1", d => xSkala(d.x0) + paddingStupci / 2)
      .attr("x2", d => xSkala(d.x0) + paddingStupci / 2 + sirinaStupca(d) - paddingStupci)
      .attr("y1", d => ySkala(d[0].median))
      .attr("y2", d => ySkala(d[0].median))

    const minRasponi = sviStupci.append("line")
      .attr("class", "linija")
      .attr("x1", d => xSkala(d.x0) + paddingStupci / 2 + sirinaStupca(d) * 0.3)
      .attr("x2", d => xSkala(d.x1) - paddingStupci / 2 - sirinaStupca(d) * 0.3)
      .attr("y1", d => ySkala(d[0].rasponMin))
      .attr("y2", d => ySkala(d[0].rasponMin))

    const maxRasponi = sviStupci.append("line")
      .attr("class", "linija")
      .attr("x1", d => xSkala(d.x0) + paddingStupci / 2 + sirinaStupca(d) * 0.3)
      .attr("x2", d => xSkala(d.x1) - paddingStupci / 2 - sirinaStupca(d) * 0.3)
      .attr("y1", d => ySkala(d[0].rasponMax))
      .attr("y2", d => ySkala(d[0].rasponMax))

    const outliers = sviStupci.append("g")
        .attr("transform", d => `translate(${xSkala(d.x0) + sirinaStupca(d) / 2}, 0)`)
      .selectAll("circle")
      .data(d => d[0].outliers)
      .enter().append("circle")
        .attr("class", "outlier")
        .attr("cy", d => ySkala(yAccessor(d)))
        .attr("r", 2)

    const parserMjeseca = d3.timeParse("%m")
    const formatMjeseca = d3.timeFormat("%b")
    const oznake = sviStupci.append("text")
        .attr("class", "oznaka")
        .attr("transform", d => `translate(${xSkala(d.x0) + sirinaStupca(d) / 2}, -15)`)
        .text(d => formatMjeseca(parserMjeseca(d[0].mjesec)))

  // 6. Draw peripherals

  const yOsGenerator = d3.axisLeft()
    .scale(ySkala)
    .ticks(4)

  const yOs = granice.append("g")
      .attr("class", "y-os")
    .call(yOsGenerator)

  const yOsOznaka = yOs.append("text")
      .attr("class", "y-os-oznaka")
      .attr("x", -dimenzije.grVisina / 2)
      .attr("y", -dimenzije.margine.left + 10)
      .html("Maksimalna Temperatura (&deg;C)")
}
crtajBox()