/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateClinic($input: CreateClinicInput!) {\n    createClinic(input: $input) {\n      id\n      name\n      legalName\n      email\n      phone\n      address\n      city\n      country\n      timezone\n      website\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateClinicDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      clinics {\n        id\n        name\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Logout($refreshToken: String!) {\n    logout(refreshToken: $refreshToken)\n  }\n": typeof types.LogoutDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation RegisterCompany($input: RegisterCompanyInput!) {\n    registerCompany(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n": typeof types.RegisterCompanyDocument,
    "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      firstName\n      lastName\n      role\n      clinicId\n      clinic {\n        id\n        name\n        legalName\n        email\n        phone\n        address\n        city\n        country\n        timezone\n        website\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.CurrentUserDocument,
    "\n  query GetPatients {\n    patients {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": typeof types.GetPatientsDocument,
};
const documents: Documents = {
    "\n  mutation CreateClinic($input: CreateClinicInput!) {\n    createClinic(input: $input) {\n      id\n      name\n      legalName\n      email\n      phone\n      address\n      city\n      country\n      timezone\n      website\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateClinicDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      clinics {\n        id\n        name\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout($refreshToken: String!) {\n    logout(refreshToken: $refreshToken)\n  }\n": types.LogoutDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation RegisterCompany($input: RegisterCompanyInput!) {\n    registerCompany(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n": types.RegisterCompanyDocument,
    "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      firstName\n      lastName\n      role\n      clinicId\n      clinic {\n        id\n        name\n        legalName\n        email\n        phone\n        address\n        city\n        country\n        timezone\n        website\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.CurrentUserDocument,
    "\n  query GetPatients {\n    patients {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n": types.GetPatientsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateClinic($input: CreateClinicInput!) {\n    createClinic(input: $input) {\n      id\n      name\n      legalName\n      email\n      phone\n      address\n      city\n      country\n      timezone\n      website\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateClinic($input: CreateClinicInput!) {\n    createClinic(input: $input) {\n      id\n      name\n      legalName\n      email\n      phone\n      address\n      city\n      country\n      timezone\n      website\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      clinics {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      clinics {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Logout($refreshToken: String!) {\n    logout(refreshToken: $refreshToken)\n  }\n"): (typeof documents)["\n  mutation Logout($refreshToken: String!) {\n    logout(refreshToken: $refreshToken)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RegisterCompany($input: RegisterCompanyInput!) {\n    registerCompany(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterCompany($input: RegisterCompanyInput!) {\n    registerCompany(input: $input) {\n      user {\n        id\n        email\n        firstName\n        lastName\n        role\n        clinicId\n      }\n      tokens {\n        accessToken\n        refreshToken\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      firstName\n      lastName\n      role\n      clinicId\n      clinic {\n        id\n        name\n        legalName\n        email\n        phone\n        address\n        city\n        country\n        timezone\n        website\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      firstName\n      lastName\n      role\n      clinicId\n      clinic {\n        id\n        name\n        legalName\n        email\n        phone\n        address\n        city\n        country\n        timezone\n        website\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPatients {\n    patients {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n"): (typeof documents)["\n  query GetPatients {\n    patients {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;