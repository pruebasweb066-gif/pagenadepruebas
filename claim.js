// 📌 Cambia esta dirección por tu contrato TokenX desplegado
const CONTRACT_ADDRESS = "0xb38B8262e9d1566dd09dd03b646560Fe24715bF3"; // ← PON TU DIRECCIÓN REAL AQUÍ

// ABI mínimo del contrato TokenX
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

// Conectar wallet
connectWalletBtn.onclick = async () => {
  try {
    if (!window.ethereum) {
      alert("Necesitas MetaMask o Trust Wallet");
      return;
    }

    // Solicitar acceso a cuentas
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Usar Web3Provider para compatibilidad total
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const walletAddress = await signer.getAddress();
    walletSpan.textContent = walletAddress;

    // Crear contrato
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // Mostrar tokens pendientes
    await updatePending();

    // Actualizar cada 5 segundos
    setInterval(updatePending, 5000);

  } catch (err) {
    console.error("Error al conectar wallet:", err);
    alert("Error al conectar wallet: " + err.message);
  }
};

// Función para actualizar tokens pendientes
async function updatePending() {
  if (!contract || !signer) return;

  try {
    const walletAddress = await signer.getAddress();
    const pending = await contract.pendingRewards(walletAddress);
    pendingSpan.textContent = ethers.utils.formatUnits(pending, 18);
  } catch (err) {
    console.error("Error al obtener tokens pendientes:", err);
    pendingSpan.textContent = "0";
  }
}

// Reclamar tokens
claimBtn.onclick = async () => {
  if (!contract) {
    alert("Conecta tu wallet primero");
    return;
  }

  try {
    const tx = await contract.claim();
    await tx.wait();
    alert("Tokens reclamados correctamente!");
    await updatePending();
  } catch (err) {
    console.error("Error al reclamar tokens:", err);
    alert("Error al reclamar tokens: " + err.message);
  }
};
