import AdminDashboard from '../Pages/DashboardAdmin'
import DeliveryAgentDashboard from '../Pages/DeliveryAgentDashboard'
import ParcelDeliveryPortal from '../Pages/ParcelDeliveryPortal'
import useAuthStore from '../store/useAuthStore'

const DashboardLayout = () => {
  const { user } = useAuthStore()
  console.log(user?.role)
  return (
    <>
      {user?.role === 'customer' && <ParcelDeliveryPortal />}
      {user?.role === 'agent' && <DeliveryAgentDashboard />}
      {user?.role === 'admin' && <AdminDashboard />}
    </>
  )
}

export default DashboardLayout
