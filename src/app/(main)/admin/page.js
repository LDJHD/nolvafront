import AdminDashboard from '@/components/admin/AdminDashboard'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'

const page = () => {
  return (
    <>
      <Breadcrumb title="Administration NOLVA" />
      <AdminDashboard />
    </>
  )
}

export default page
