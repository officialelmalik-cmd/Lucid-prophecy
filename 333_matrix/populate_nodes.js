const nodes = [];
for (let i = 1; i <= 4000; i++) {
  nodes.push({
    node_id: "node_" + i,
    sub_cluster_id: Math.ceil(i / 100),
    state: "Gold",
    frequency: "1951Hz",
    sovereign_credits: 333,
    saturation: 0.21,
    last_sync: new Date().toISOString(),
    is_superconductive: true
  });
}
console.log(JSON.stringify(nodes));
