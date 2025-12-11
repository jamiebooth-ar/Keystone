export interface CountryInsight {
    country: string;
    spend: number;
    impressions: number;
    reach: number;
    cpm: number;
    frequency: number;
    link_clicks: number;
    ctr: number;
    cpc: number;
    leads: number;
    cpl: number;
    conversions: number;
    cvr: number;
    is_targeted: boolean;
    recent_7d_cpm: number;
}

export interface Campaign {
    id: string;
    name: string;
    status: string;
    effective_status: string;
    daily_budget?: number;
    total_spend: number;
    total_impressions: number;
    country_count: number;
    countries: CountryInsight[];
    campaign_type?: string;
    brand?: string;
    platform?: string;
    campaign_date?: string;
}

export interface ManagedEvent {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    location_building?: string;
    city?: string;
    address?: string;
    type_id: number;
    status_id: number;
    standard_price?: number;
    brand?: string;
}

export interface GeoLocation {
    id: number;
    name: string;
    parent_id?: number;
    friendly_name?: string;
    location_type_id: number;
    location_code?: string;
    nationality?: string;
    latitude?: number;
    longitude?: number;
    children?: GeoLocation[]; // For tree view
}

export interface Order {
    id: number;
    purchaser_id: number;
    purchaser_type_id: number;
    order_total: number;
    timestamp: string;
    status_id: number; // 1=Committed, 2=Cancelled
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role_id: number;
    department_id: number;
    status: boolean;
}

export interface PredictionRequest {
    campaign_type: "Brand" | "LeadGen";
    countries: string[];
    allocations: Record<string, number>;
    duration: number;
}

export interface PredictionResult {
    summary: {
        client_spend: number;
        media_spend: number;
        duration_months: number;
        campaign_type: string;
    };
    breakdown: {
        country: string;
        budget: number;
        impressions: number;
        reach: number;
        link_clicks: number;
        leads: number;
        cpm: number;
        cpc: number;
        cpl: number;
        frequency: number;
    }[];
    totals: {
        impressions: number;
        reach: number;
        link_clicks: number;
        leads: number;
    };
}

export interface MarketingPopup {
    id: number;
    title: string;
    content?: string;
    image_url?: string;
    target_url?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    target_domains?: string;
    target_countries?: string;
}

export interface SplashBanner {
    id: number;
    name: string;
    image_url: string;
    target_url: string;
    weight: number;
    is_active: boolean;
    created_at: string;
}

export interface BenchmarkAgg {
    month: string;
    collection_id: number;
    stat_total: number;
    aggregate: number;
}

export interface Mailshot {
    id: number;
    title: string;
    subject: string;
    content: string;
    status: string;
    created_at: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
}

export interface PageTemplate {
    id: number;
    title: string;
    content: string;
    mode: number;
    domains: number;
    created_on: string;
}

export interface CampaignList {
    Brand: Campaign[];
    LeadGen: Campaign[];
}
