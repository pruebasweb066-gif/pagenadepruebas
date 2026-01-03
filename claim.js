// 📌 Dirección del contrato TokenX desplegado
const CONTRACT_ADDRESS = "0xTU_CONTRATO_TOKENX"; // Cambia por tu contrato

// ABI mínimo del contrato
const ABI = [
  "function pendingRewards(address user) view returns (uint256)",
  "function claim()"
];

let provider;
let signer;
let contract;

const connectWalletBtn = document.getElementById("connectWallet");
const walletSpan = document.getElementById("wallet");
const pendingSpan = document.getElementById("pending");
const claimBtn = document.getElementById("claimButton");

// Conectar Wallet
connectWalletBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("Necesitas MetaMask o Trust Wallet");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const walletAddress = await signer.getAddress();
  walletSpan.textContent = walletAddress;

  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  // Actualizar tokens pendientes al conectar
  updatePending();

  // Actualizar cada 5 segundos
  setInterval(updatePending, 5000);
};

// Función para actualizar tokens pendientes
async function updatePending() {
  if (!contract || !signer) return;

  const walletAddress = await signer.getAddress();
  const pending = await contract.pendingRewards(walletAddress);
  pendingSpan.textContent = ethers.formatUnits(pending, 18);
}

// Reclamar tokens
claimBtn.onclick = async () => {
  if (!contract) return;

  try {
    const tx = await contract.claim();
    await tx.wait(); // Espera confirmación
    alert("Tokens reclamados correctamente!");
    updatePending();
  } catch (err) {
    console.error(err);
    alert("Error al reclamar tokens: " + err.message);
  }
};
