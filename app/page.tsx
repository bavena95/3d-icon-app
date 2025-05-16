"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import StyleExamples from "@/components/style-examples"
import BeforeAfterShowcase from "@/components/before-after-showcase"
import { Toaster } from "@/components/ui/toaster"
import { ArrowRight, Award, Check } from "lucide-react"
import UserButton from "@/components/auth/user-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">icon3d.ai</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#before-after" className="text-gray-600 hover:text-black transition-colors">
              Before & After
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-black transition-colors">
              Pricing
            </Link>
          </nav>
          <UserButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-100 mb-6">
                <Award className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-500">#1 3D Icon Generator</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Ideas into 3D Icons
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create stunning animated 3D icons from simple descriptions. Choose your favorite style and download
                instantly!
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-6 text-lg"
                  onClick={() => document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See Examples
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder-hero.png"
                  alt="3D Icon example"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                <StyleExamples />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Style Examples</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Explore the different 3D icon styles you can create with our platform.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image
                    src={`/placeholder-example-${i}.png`}
                    alt={`Icon example ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">Style {i}</h3>
                  <p className="text-sm text-gray-500">Animated 3D icon</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-full px-8" asChild>
              <Link href="/dashboard">
                Create My Icon
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section id="before-after" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Before & After</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            See the transformation from simple concepts to stunning 3D icons.
          </p>

          <BeforeAfterShowcase />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">How It Works</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Three simple steps to create your custom 3D icon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Describe",
                description: "Type a detailed description of the icon you want to create.",
              },
              {
                step: "2",
                title: "Generate",
                description: "Our AI transforms your description into a high-quality 3D animated icon.",
              },
              {
                step: "3",
                title: "Download",
                description: "Choose your preferred format and download the icon to use anywhere.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Simple Pricing</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Choose the plan that best fits your needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Single Icon",
                price: "$2.40",
                credits: 1,
                perIcon: "$2.40",
                features: ["1 3D icon", "High resolution", "Commercial use", "No watermark"],
                popular: false,
              },
              {
                name: "Small Pack",
                price: "$19.90",
                credits: 10,
                perIcon: "$1.99",
                features: ["10 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
                popular: true,
              },
              {
                name: "Medium Pack",
                price: "$49.90",
                credits: 30,
                perIcon: "$1.66",
                features: ["30 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl overflow-hidden ${
                  plan.popular
                    ? "border-2 border-black shadow-xl scale-105 bg-white"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="bg-black text-white py-1.5 px-4 text-center">
                    <span className="text-xs font-medium">Most Popular</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-1">/ one-time</span>
                  </div>
                  <p className="text-gray-600 mb-2">{plan.credits} credits</p>
                  <p className="text-sm text-gray-500 mb-6">{plan.perIcon} per icon</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    } rounded-full`}
                    asChild
                  >
                    <Link href="/sign-up">Buy Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Large Pack",
                price: "$74.90",
                credits: 50,
                perIcon: "$1.50",
                features: ["50 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
              },
              {
                name: "XL Pack",
                price: "$129.90",
                credits: 100,
                perIcon: "$1.30",
                features: ["100 3D icons", "High resolution", "Commercial use", "No watermark", "Priority support"],
              },
            ].map((plan) => (
              <div key={plan.name} className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-gray-600">{plan.credits} credits</p>
                      <p className="text-sm text-gray-500">{plan.perIcon} per icon</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <p className="text-sm text-gray-500">one-time payment</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full" asChild>
                    <Link href="/sign-up">Buy Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold">icon3d.ai</h1>
              <p className="text-gray-500 mt-1">© 2023 All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </main>
  )
}
