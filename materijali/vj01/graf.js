const crtajGraf = async () => {
    const dataset = await d3.json("vrijeme.json");
    console.log(dataset)   
};
crtajGraf();
