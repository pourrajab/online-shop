import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

interface GoogleProfile {
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value?: string }>;
  photos?: Array<{ value?: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET_ID,
            callbackURL: "http://localhost:3000/auth/google/redirect",
            scope: ['email', 'profile']
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) {
        const {name, emails, photos} = profile;
        const {givenName: firstName, familyName: lastName} = name;
        const [emailData] = emails;
        const [image] = photos;
        const user = {
            firstName,
            lastName,
            email: emailData?.value,
            profile_image: image?.value,
            accessToken
        }
        done(null, user)
    }
}