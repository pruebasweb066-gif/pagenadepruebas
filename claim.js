// 🔹 Cambia esta dirección por la de tu contrato TokenX desplegado
const CONTRACT_ADDRESS = "0xb38B8262e9d1566dd09dd03b646560Fe24715bF3"; // ← tu dirección real
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

// Inicializar WalletConnect + ethers.js
async function connectWallet() {
  try {
    // Crear provider WalletConnect
    const wcProvider = new WalletConnectProvider.default({
      infuraId: "TU_INFURA_ID_AQUI" // ⚡ Puedes usar Infura o RPC de tu red
    });

    // Solicitar conexión
    await wcProvider.enable();

    // Crear provider ethers
    provider = new ethers.providers.Web3Provider(wcProvider);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const walletAddress = await signer.getAddress();
    walletSpan.textContent = walletAddress;

    // Actualizar tokens pendientes cada 5 segundos
    await updatePending();
    setInterval(updatePending, 5000);

    // Escuchar cambios de cuentas
    wcProvider.on("accountsChanged", async (accounts) => {
      if (accounts.length === 0) {
        walletSpan.textContent = "No conectada";
      } else {
        walletSpan.textContent = accounts[0];
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        await updatePending();
      }
    });

  } catch (err) {
    console.error("Error al conectar wallet:", err);
    alert("Error al conectar wallet: " + err.message);
  }
}

// Mostrar tokens pendientes
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

// Eventos
connectWalletBtn.onclick = connectWallet;
