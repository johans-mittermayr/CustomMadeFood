import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-light via-white to-brand-orange-light">
      {/* Navegação */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image src="/logoCMF.png" alt="CMF" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">
                CustomMadeFood
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red">
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight">
            Sua refeição,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">
              seus macros
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Personalize cada grama da sua refeição. Escolha os ingredientes,
            defina as porções exatas e atinja seus objetivos nutricionais — tudo
            nos seus restaurantes favoritos.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/restaurants">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red text-lg px-8 py-6"
              >
                Ver restaurantes
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de funcionalidades */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-brand-red-light flex items-center justify-center text-brand-red mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Porções personalizadas
            </h3>
            <p className="mt-2 text-gray-600">
              Escolha exatamente quantas gramas de cada ingrediente você quer.
              100g de arroz, 50g de feijão — você decide.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Acompanhe seus macros
            </h3>
            <p className="mt-2 text-gray-600">
              Veja os totais nutricionais em tempo real enquanto monta seu prato.
              Calorias, proteína, carboidratos, gordura — tudo calculado na hora.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Preparo preciso
            </h3>
            <p className="mt-2 text-gray-600">
              A equipe da cozinha pesa cada ingrediente conforme suas
              especificações. Cada prato é feito exatamente como você pediu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
