import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>UNC AI Telegram Bot</title>
        <meta name="description" content="UNC AI Telegram Bot Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">UNC AI Telegram Bot</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your AI-powered Telegram bot is running and ready to assist! 🚀
          </p>
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Bot Status</h2>
            <p className="text-green-400 text-lg">
              ✅ Bot is active and listening for messages
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 