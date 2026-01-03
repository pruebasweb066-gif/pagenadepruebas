let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "DIRECCION_DE_TU_CONTRATO";

const ABI = [
  "function claim() external",
  "function pendingRewards(address user) view returns (uint256)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert("Instala MetaMask");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("wallet").innerText =
    "Wallet: " + address.slice(0, 6) + "..." + address.slice(-4);

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  updateRewards();
}

async function updateRewards() {
  if (!contract || !signer) return;

  const address = await signer.getAddress();
  const rewards = await contract.pendingRewards(address);

  const formatted = ethers.formatUnits(rewards, 18);
  document.getElementById("rewards").innerText =
    "Pendiente: " + Number(formatted).toFixed(4) + " XTK";
}

async function claimTokens() {
  if (!contract) {
    alert("Conecta la wallet primero");
    return;
  }

  try {
    const tx = await contract.claim();
    document.getElementById("rewards").innerText =
      "⏳ Confirmando transacción...";

    await tx.wait();

    alert("✅ Tokens reclamados");
    updateRewards();
  } catch (err) {
    console.error(err);
    alert("❌ Error al reclamar tokens");
  }
}

