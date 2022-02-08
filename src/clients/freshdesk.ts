//curl -v -u xJ5WG2i4BlCQB5wiznR:X -X GET 'https://fdghjk.freshdesk.com/api/v2/contacts'
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { GithubUserType } from "./github";
import { CliUx } from "@oclif/core";

export type FreshDeskContactType = {
  active: boolean;
  address?: string;
  description?: string;
  email?: string;
  id?: number;
  job_title: string;
  language?: string;
  mobile?: string;
  name: string;
  phone?: string;
  time_zone?: string;
  twitter_id?: string;
  facebook_id?: string;
  created_at?: string;
  updated_at?: string;
  csat_rating?: string;
  company_id?: number;
  other_companies?: [];
  unique_external_id?: string;
};

export default class FreshdeskClient {
  private client: AxiosInstance;

  constructor(token: string, domain: string) {
    this.client = axios.create({
      baseURL: `https://${domain}.freshdesk.com/api/v2/`,
      auth: {
        username: token,
        password: "X",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  testCredentials = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    CliUx.ux.action.start("Testing FRESHDESK token and DOMAIN");
    try {
      await this.listContacts();
    } catch (e: any) {
      return {
        success: false,
        message:
          "There was an error with your FRESHDESK credentials: " + e.message,
      };
    }
    CliUx.ux.action.stop(); // shows 'starting a process... done'
    return { success: true };
  };

  listContacts = async (): Promise<AxiosResponse<any>> =>
    this.client.get(`contacts`);

  findContactByUsername = async (
    username: string
  ): Promise<FreshDeskContactType | undefined> => {
    return this.client.get(
      `search/contacts?query="email:'${username}@fakemail.com'"`
    );
  };

  createContact = async (
    data: FreshDeskContactType
  ): Promise<FreshDeskContactType | undefined> =>
    this.client.post(`contacts`, data);

  updateContactById = async (
    data: FreshDeskContactType,
    id: number
  ): Promise<FreshDeskContactType | undefined> =>
    this.client.put(`contacts/${id}`, data);
}
