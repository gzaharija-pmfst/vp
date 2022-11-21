async function dodajEvent() {
  const boje = [
    "yellowgreen",
    "cornflowerblue",
    "seagreen",
    "slateblue",
  ]

  // dodajemo podatke rect elementima
  const kvadrati = d3.select("#svg")
    .selectAll(".rect")
    .data(boje)
    .enter().append("rect")
      .attr("height", 100)
      .attr("width", 100)
      .attr("x", (d,i) => i * 110)
      .attr("fill", "lightgrey")

  // Ovdje pisemo kôd
  kvadrati.on("mouseenter", function(event, podatak){
    console.log({event, podatak}, this)
    d3.select(this).style("fill", podatak)
  })
  kvadrati.on("mouseleave", function(){
    d3.select(this).style("fill", "lightgrey")
  })

  setTimeout(() => {
    kvadrati.dispatch("mouseleave")
      .on("mouseenter", null)
      .on("mouseleave", null)
  }, 5000)

}
dodajEvent()