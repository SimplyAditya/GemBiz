export type UserInput = {
    email: string;
    password: string;
    name: string;
    phone?: string;
};
export type GST = {
    id: string;
    gst_file_url?: string;
    gst_file_type?: string;
    gst_no?: string;
};
export type Business = {
    id: string;
    storeverified: boolean;
    category: string;
    name: string;
    description: string;
    email: string;
    website?: string;
    gst_id?: string;
    gst?: GST;
    logo_image_url?: string;
    mobile: string;
    address: string;
    user_type: string;
    user_name: string;
    uid: string;
    created_at?: string;
    updated_at?: string;
};
export type GSTInput = {
    gst_file_url?: string;
    gst_file_type?: string;
    gst_no?: string;
};
export type BusinessInput = {
    storeverified: boolean;
    category: string;
    name: string;
    description: string;
    email: string;
    website?: string;
    gst: GSTInput;
    logo_image_url?: string;
    mobile: string;
    address: string;
    user_type: string;
    user_name: string;
    uid: string;
};
//# sourceMappingURL=user.types.d.ts.map