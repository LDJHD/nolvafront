import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import VendorList from '@/components/vendor/VendorList'

const page = () => {
    return (
        <>
            <Breadcrumb title={"Prestataires"} />
            <VendorList />
        </>
    )
}

export default page
