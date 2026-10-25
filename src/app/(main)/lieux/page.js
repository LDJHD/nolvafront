import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import VendorList from '@/components/vendor/VendorList'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Lieux"} />
      <VendorList fixedType="shooter" heading="Lieux et espaces événementiels" />
    </>
  )
}

export default page
