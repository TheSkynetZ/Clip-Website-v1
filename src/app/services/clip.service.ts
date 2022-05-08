import { Injectable } from '@angular/core';
import Clip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, of, map } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  private clipCollection: AngularFirestoreCollection<Clip>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipCollection = db.collection('clip');
  }

  addClip(data: Clip): Promise<DocumentReference<Clip>> {
    return this.clipCollection.add(data);
  }

  getUserClip() {
    return this.auth.user.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }
        const clipQuery = this.clipCollection.ref.where('uid', '==', user.uid);
        return clipQuery.get();
      }),
      map((snapshot) => {
        return (snapshot as QuerySnapshot<Clip>).docs;
      })
    );
  }

  updateClip(id: string, title: string) {
    return this.clipCollection.doc(id).update({ clipTitle: title });
  }

  async deleteClip(clip: Clip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    await clipRef.delete();
    await this.clipCollection.doc(clip.documentId).delete();
  }
}
