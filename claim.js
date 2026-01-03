const CONTRACT_ADDRESS = "0xb38B8262e9d1566dd09dd03b646560Fe24715bF3"; // tu contrato real
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

// Función para inicializar provider y signer
async function initWallet() {
  if (!window.ethereum) return;

  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  try {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      const walletAddress = accounts[0];
      walletSpan.textContent = walletAddress;
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      await updatePending();
      setInterval(updatePending, 5000);
    }
  } catch (err) {
    console.error("Error al inicializar wallet:", err);
  }

  // Escuchar cambios de cuenta
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length === 0) {
      walletSpan.textContent = "No conectada";
    } else {
      walletSpan.textContent = accounts[0];
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      await updatePending();
    }
  });
}

// Conectar wallet manualmente con botón
connectWalletBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("Necesitas MetaMask o Trust Wallet");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await initWallet();
  } catch (err) {
    console.error("Error al conectar wallet:", err);
    alert("Error al conectar wallet: " + err.message);
  }
};

// Actualizar tokens pendientes
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

// Inicializar al cargar la página
window.addEventListener("load", initWallet);
