import CookieConsent from './components/CookieConsent'
import Navigation from './components/Navigation'
import {ArrowRight, Compass, MapPin, Tag} from "lucide-react";
import {NavLink} from "react-router-dom";
import Footer from "./components/Footer.tsx";

function App() {

  return (
      <>
          <div className="min-h-screen bg-retro-light">
              <div className="min-h-screen flex flex-col">
                  <Navigation/>
                  <main className="flex-grow bg-gradient-to-br from-pink-50 via-white to-blue-50">
                      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
                          {/* Hero Section */}
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                              {/* Hero Content */}
                              <div className="max-w-xl lg:max-w-2xl mb-12 lg:mb-0">
                                  <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-retro-primary">
                  What's New
                </span>
                                      <span className="inline-flex items-center text-sm text-gray-600">
                  Just launched
                  <ArrowRight className="ml-1 h-4 w-4"/>
                </span>
                                  </div>

                                  <h1 className="mt-6 lg:mt-10">
                <span className="block text-4xl lg:text-6xl font-medium tracking-tight text-gray-900">
                  Discover Amazing
                </span>
                                      <span
                                          className="mt-2 block text-4xl lg:text-6xl font-medium tracking-tight text-retro-primary">
                  Local Deals
                </span>
                                  </h1>

                                  <p className="mt-6 text-lg leading-8 text-gray-600">
                                      Find exclusive discounts and offers from your favorite local
                                      businesses. Save money while supporting your community with our
                                      innovative spin-to-win deals!
                                  </p>

                                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                      <NavLink
                                          to="/deals"
                                          className="rounded-full bg-retro-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-retro-primary/90 transition-colors text-center"
                                      >
                                          Browse Deals
                                          <ArrowRight className="ml-2 h-5 w-5 inline-block"/>
                                      </NavLink>
                                      <NavLink
                                          to="/business"
                                          className="text-base font-medium text-gray-900 hover:text-retro-primary transition-colors text-center sm:text-left px-6 py-3"
                                      >
                                          For Business
                                          <ArrowRight className="ml-2 h-5 w-5 inline-block"/>
                                      </NavLink>
                                  </div>
                              </div>

                              {/* Feature Cards */}
                              <div className="grid grid-cols-1 gap-6 lg:w-[450px]">
                                  {/* Card 1 - 50% Off Deal */}
                                  <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                      <div
                                          className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                                          <Tag className="h-5 w-5 text-retro-primary mb-3"/>
                                          <h3 className="text-xl font-semibold text-gray-900">50% Off Deal</h3>
                                          <p className="mt-1 text-sm text-gray-500">Limited time offer!</p>
                                      </div>
                                  </div>

                                  {/* Card 2 - Spin & Win */}
                                  <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                      <div
                                          className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                                          <Compass className="h-5 w-5 text-blue-500 mb-3"/>
                                          <h3 className="text-xl font-semibold text-gray-900">Spin & Win</h3>
                                          <p className="mt-1 text-sm text-gray-500">Try your luck today!</p>
                                      </div>
                                  </div>

                                  {/* Card 3 - Local Favorites */}
                                  <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                      <div
                                          className="rounded-2xl bg-white p-6 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100">
                                          <MapPin className="h-5 w-5 text-green-500 mb-3"/>
                                          <h3 className="text-xl font-semibold text-gray-900">Local Favorites</h3>
                                          <p className="mt-1 text-sm text-gray-500">Discover nearby deals</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </main>
                  <Footer/>
              </div>
          </div>
          <CookieConsent/>
      </>
  )
}

export default App
