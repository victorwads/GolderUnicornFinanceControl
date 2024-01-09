//
//  ContentView.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 07/01/24.
//

import _AuthenticationServices_SwiftUI
import FirebaseAuth
import GoogleSignInSwift
import SwiftUI

struct ContentView: View {
    @ObservedObject var authManager = AuthenticationManager()
    var previewInfo: String? = nil

    var body: some View {
        VStack {
            Spacer()
            if let userInfo = previewInfo ?? authManager.userInfo {
                Text("Olá, \(userInfo)")
                    .foregroundColor(.white)
                Button("Logout") {
                    authManager.logOut()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(.white)
                .cornerRadius(5)
            } else {
                SignInWithAppleButton(.signIn) { request in
                    request.nonce = authManager.getShaNonce()
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { result in
                    switch result {
                    case let .success(authResults):
                        authManager.continueFirebaseLogin(authResults)
                        print("Authorisation successful")
                    case let .failure(error):
                        authManager.updateUser()
                        print("Authorisation failed: \(error.localizedDescription)")
                    }
                }
                .signInWithAppleButtonStyle(.whiteOutline)
                .frame(height: 45)
                Button("Sign In With Google") {
                    authManager.googleLogin()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(.white)
                .cornerRadius(5)
            }
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(hex: 0x282C34))
    }
}

#Preview {
    ContentView(previewInfo: "User - email")
}

#Preview {
    ContentView()
}
