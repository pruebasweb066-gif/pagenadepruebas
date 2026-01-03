let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0xb38B8262e9d1566dd09dd03b646560Fe24715bF3";

const ABI = [
  "function claim() external",
  "function pendingRewards(address user) view returns (uint256)"
];

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("claimBtn").addEventListener("click", claimTokens);
});

async function connectWallet() {
  if (!window.ethereum) {
    alert("❌ MetaMask no está instalada");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const address = await signer.getAddress();
    document.getElementById("wallet").innerText =
      "Wallet: " + address.slice(0, 6) + "..." + address.slice(-4);

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    updateRewards();
  } catch (err) {
    console.error(err);
    alert("Error al conectar la wallet");
  }
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
    document.getElementById("rewards").innerText = "⏳ Confirmando...";
    const tx = await contract.claim();
    await tx.wait();

    alert("✅ Tokens reclamados");
    updateRewards();
  } catch (err) {
    console.error(err);
    alert("❌ Error al reclamar tokens");
  }
}

