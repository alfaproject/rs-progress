import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class FunctionService {
  public constructor(
    private aff: AngularFireFunctions,
  ) {
    // (aff.functions as any).useFunctionsEmulator('http://localhost:5000');
  }

  public call<T, R>(name: string, data: T) {
    return this.aff.httpsCallable<T, R>(name)(data);
  }
}
