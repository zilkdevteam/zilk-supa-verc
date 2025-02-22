import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import './globals.css'
import App from './App.tsx'
import Cookies from './pages/Cookies.tsx'
import Auth from './pages/Auth.tsx'
import AuthResetPassword from './pages/AuthResetPassword.tsx'
import Business from './pages/Business.tsx'
import BusinessAnalytics from './pages/BusinessAnalytics.tsx'
import BusinessDashboard from './pages/BusinessDashboard.tsx'
import BusinessDeals from './pages/BusinessDeals.tsx'
import BusinessDealsCreate from './pages/BusinessDealsCreate.tsx'
import BusinessDealsEdit from './pages/BusinessDealsEdit.tsx'
import BusinessDealsNew from './pages/BusinessDealsNew.tsx'
import BusinessInfo from './pages/BusinessInfo.tsx'
import BusinessOnboarding from './pages/BusinessOnboarding.tsx'
import Deals from './pages/Deals.tsx'
import DealsPage from './pages/DealsID.tsx'
import Privacy from './pages/Privacy.tsx'
import Spin from './pages/Spin.tsx'
import Terms from './pages/Terms.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" >
                <Route index  element={<App />}/>
                <Route path="/auth">
                    <Route index element={<Auth />}/>
                    <Route path="resetpassword" element={<AuthResetPassword />} />
                </Route>
                <Route path="/business" >
                    <Route path="/business" element={<Business />}/>
                    <Route path="/business/analytics" element={<BusinessAnalytics />}/>
                    <Route path="/business/dashboard" element={<BusinessDashboard />}/>
                    <Route path="/business/deals">
                        <Route path="/business/deals" element={<BusinessDeals/>}/>
                        <Route path="/business/deals/create" element={<BusinessDealsCreate />}/>
                        <Route path="/business/deals/:id/edit" element={<BusinessDealsEdit />}/>
                        <Route path="/business/deals/new" element={<BusinessDealsNew />}/>
                    </Route>
                    <Route path="/business/info" element={<BusinessInfo />}/>
                    <Route path="/business/onboarding" element={<BusinessOnboarding />}/>
                </Route>
                <Route path="/cookies" element={<Cookies />}/>
                <Route path="/deals">
                    <Route index element={<Deals />}/>
                    <Route path="/deals/:id" element={<DealsPage/>}/>
                </Route>
                <Route path="/privacy" element={<Privacy />}/>
                <Route path="/spin" element={<Spin />}/>
                <Route path="/terms" element={<Terms />}/>
            </Route>
        </Routes>
    </BrowserRouter>,
)
