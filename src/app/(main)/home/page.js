"use client";

import HeroSlider from "@/components/hero/HeroSlider";
import HomeProviderCategories from "@/components/home/HomeProviderCategories";
import NolvaServices from "@/components/home/NolvaServices";
import PopularProviders from "@/components/providers/PopularProviders";
import HomeEvents from "@/components/events/HomeEvents";

const page = () => {
    return (
        <>
            <HeroSlider />
            <HomeProviderCategories />
            <PopularProviders />
            <HomeEvents />
            <NolvaServices />
        </>
    )
}

export default page
