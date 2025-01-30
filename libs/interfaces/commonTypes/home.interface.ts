export interface Iheader{
    favicon:string,
    header_logo:string,
    header_links: string
}

export interface Uheader{ 
    header_id: string,
    favicon?:string,
    header_logo?:string,
    header_links?: string
}

export interface IBanner{ 
    banner_image: string,
    banner_title: string,
    banner_heading: string
} 

export interface UBanner{ 
    banner_id:string,
    banner_image:string,
    banner_title:string,
    banner_heading:string
}


export interface IService{
    service_image:string,
    service_name:string,
    service_status:string
}

export interface UService{
    service_id: string,
    service_image: string,
    service_name: string,
    service_status: string
}


export interface IFestival{
    festival_image: string,
    festival_name: string,
    festival_discount: string,
    festival_status: string
}

export interface UFestival{
    festival_id: string,
    festival_image: string,
    festival_name: string,
    festival_discount: string,
    festival_status: string
}

export interface IOffer{
    offer_image: string,
    offer_title: string,
    offer_description: string,
    offer_listing: string,
    button_name: string
}

export interface UOffer{
    offer_id: string,
    offer_image: string,
    offer_title: string,
    offer_description: string,
    offer_listing: string,
    button_name: string
}

export interface ITestimonial{
    testimonial_image:string,
    testimonial_description:string,
    testimonial_name:string,
    testimonial_profession:string,
    status:string
}

export interface UTestimonial{
    testimonial_id:string,
    testimonial_image:string,
    testimonial_description:string,
    testimonial_name:string,
    testimonial_profession:string,
    status:string
}

export interface IAbout{
    about_image:string,
    about_heading:string,
    about_description:string,
    about_button:string
}

export interface UAbout{
    about_id:string,
    about_image:string,
    about_heading:string,
    about_description:string,
    about_button:string
}


export interface IFaq{
    faq_question:string,
    faq_answer:string,
    faq_status:string
}

export interface UFaq{
    faq_id:string,
    faq_question:string,
    faq_answer:string,
    faq_status:string
}


export interface ISocial{
    icon_image:string,
    icon_link:string,
    icon_status:string
}

export interface USocial{
    social_id:string,
    icon_image:string,
    icon_link:string,
    icon_status:string
}


export interface IFooter{
    footer_image:string,
    our_services:string,
    company:string,
    support:string,
    destinations:string,
    contact_address:string,
    contact_number:string,
    contact_email:string,
    copy_right:string
}

export interface UFooter{
    footer_id: string,
    footer_image:string,
    our_services:string,
    company:string,
    support:string,
    destinations:string,
    contact_address:string,
    contact_number:string,
    contact_email:string,
    copy_right:string
}





