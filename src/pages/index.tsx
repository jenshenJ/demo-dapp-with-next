import Head from "next/head";
import dynamic from "next/dynamic";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { WalletBatchLimitsTester } from "../components/WalletBatchLimitsTester/WalletBatchLimitsTester";

// Динамические импорты для компонентов с react-json-view или localStorage
const TxForm = dynamic(() => import("../components/TxForm/TxForm").then(mod => ({ default: mod.TxForm })), { ssr: false, loading: () => <div>Loading transaction form...</div> });
const TonProofDemo = dynamic(() => import("../components/TonProofDemo/TonProofDemo").then(mod => ({ default: mod.TonProofDemo })), { ssr: false, loading: () => <div>Loading TON proof demo...</div> });
const CreateJettonDemo = dynamic(() => import("../components/CreateJettonDemo/CreateJettonDemo").then(mod => ({ default: mod.CreateJettonDemo })), { ssr: false, loading: () => <div>Loading jetton demo...</div> });
const SignDataTester = dynamic(() => import("../components/SignDataTester/SignDataTester").then(mod => ({ default: mod.SignDataTester })), { ssr: false, loading: () => <div>Loading sign data tester...</div> });
const MerkleExample = dynamic(() => import("../components/MerkleExample/MerkleExample").then(mod => ({ default: mod.MerkleExample })), { ssr: false, loading: () => <div>Loading merkle example...</div> });
const FindTransactionDemo = dynamic(() => import("../components/FindTransactionDemo/FindTransactionDemo").then(mod => ({ default: mod.FindTransactionDemo })), { ssr: false, loading: () => <div>Loading find transaction demo...</div> });

export default function Home() {
  return (
    <>
      <Head>
        <title>Demo Dapp with Next.js</title>
        <meta name="description" content="TON Connect demo dapp with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="app">
        <Header />
        <TxForm />
        <WalletBatchLimitsTester />
        <SignDataTester />
        <CreateJettonDemo />
        <TonProofDemo />
        <FindTransactionDemo />
        <MerkleExample />
        <Footer />
      </div>
    </>
  );
}
