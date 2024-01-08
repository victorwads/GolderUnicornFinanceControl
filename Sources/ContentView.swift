//
//  ContentView.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 07/01/24.
//

import _AuthenticationServices_SwiftUI
import FirebaseAuth
import SwiftUI


struct ContentView: View {
    
    @ObservedObject var authManager = AuthenticationManager()

    var body: some View {
        VStack {
            Spacer()
            if let userInfo = authManager.userInfo {
                Text("Olá, \(userInfo)")
                    .foregroundColor(.white)
                Button("Logout") {
                    authManager.logOut()
                }
               .foregroundColor(.white)
               .padding()
               .background(Color.gray)
               .cornerRadius(5)
            } else {
                SignInWithAppleButton(.signIn) { request in
                    request.nonce = authManager.getShaNonce()
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { result in
                    switch result {
                    case .success(let authResults):
                        authManager.continueFirebaseLogin(authResults)
                        print("Authorisation successful")
                    case .failure(let error):
                        authManager.updateUser()
                        print("Authorisation failed: \(error.localizedDescription)")
                    }
                }
                .signInWithAppleButtonStyle(.whiteOutline)
                .frame(height: 45)
                .padding(25)
            }
            Spacer()
        }
    }

}

#Preview {
    ContentView()
}
