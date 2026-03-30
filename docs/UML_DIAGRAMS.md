# 📊 Diagrammes UML - Marketplace

## Diagramme de classes

```
┌─────────────────────────┐
│        User             │
├─────────────────────────┤
│ - id: Integer           │
│ - email: String         │
│ - hashed_password: str  │
│ - first_name: String    │
│ - last_name: String     │
│ - role: UserRole        │
│ - is_active: String     │
│ - created_at: DateTime  │
│ - updated_at: DateTime  │
├─────────────────────────┤
│ + verify_password()     │
│ + is_admin()            │
└─────────────────────────┘
           △
           │
           │ inherits
           │
    ┌──────┴───────┐
    │              │
┌───▽───┐    ┌────▽────┐
│Client │    │ Vendeur │
└───────┘    └─────────┘


┌─────────────────────────┐
│       Product           │
├─────────────────────────┤
│ - id: Integer           │
│ - name: String          │
│ - brand: String         │
│ - category: Category    │
│ - condition: Condition  │
│ - price: Float          │
│ - stock: Integer        │
│ - description: Text     │
│ - specifications: Text  │
│ - image_url: String     │
│ - is_active: String     │
│ - seller_id: Integer    │
│ - created_at: DateTime  │
├─────────────────────────┤
│ + update_stock()        │
│ + is_available()        │
└─────────────────────────┘
           △
           │ 1
           │
           │ N
┌─────────▽──────────┐
│      CartItem      │
├────────────────────┤
│ - id: Integer      │
│ - quantity: Int    │
│ - user_id: Integer │
│ - product_id: Int  │
└────────────────────┘


┌─────────────────────────┐
│        Order            │
├─────────────────────────┤
│ - id: Integer           │
│ - order_number: String  │
│ - status: OrderStatus   │
│ - total_amount: Float   │
│ - customer_id: Integer  │
│ - created_at: DateTime  │
├─────────────────────────┤
│ + calculate_total()     │
│ + update_status()       │
└─────────────────────────┘
           │ 1
           │
           │ N
           ▽
┌─────────────────────────┐
│      OrderItem          │
├─────────────────────────┤
│ - id: Integer           │
│ - quantity: Integer     │
│ - unit_price: Float     │
│ - order_id: Integer     │
│ - product_id: Integer   │
└─────────────────────────┘
```

## Diagramme de cas d'utilisation

```
┌─────────────────────────────────────────────────────┐
│                  Marketplace System                 │
│                                                     │
│   ┌─────────────┐          ┌─────────────┐        │
│   │ S'inscrire  │          │ Se connecter│        │
│   └──────┬──────┘          └──────┬──────┘        │
│          │                        │                │
│          └────────────┬───────────┘                │
│                       │                            │
│                       ▽                            │
│              ┌────────────────┐                    │
│              │   Parcourir    │                    │
│              │   produits     │                    │
│              └────────┬───────┘                    │
│                       │                            │
│         ┌─────────────┼──────────────┐            │
│         │             │              │            │
│         ▽             ▽              ▽            │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │ Ajouter  │  │  Voir    │  │ Filtrer  │      │
│   │ au panier│  │ détail   │  │ produits │      │
│   └────┬─────┘  └──────────┘  └──────────┘      │
│        │                                          │
│        ▽                                          │
│   ┌──────────┐       ┌──────────────┐           │
│   │Commander │──────►│ Payer        │           │
│   └────┬─────┘       └──────────────┘           │
│        │                                          │
│        ▽                                          │
│   ┌──────────┐                                   │
│   │  Suivre  │                                   │
│   │ commande │                                   │
│   └──────────┘                                   │
│                                                   │
└─────────────────────────────────────────────────┘

┌──────────┐                       ┌──────────┐
│  Client  │                       │ Vendeur  │
└──────────┘                       └────┬─────┘
                                        │
                    ┌───────────────────┼───────────────┐
                    │                   │               │
                    ▽                   ▽               ▽
              ┌───────────┐      ┌───────────┐   ┌──────────┐
              │   Gérer   │      │ Générer   │   │  Voir    │
              │  produits │      │description│   │commandes │
              └───────────┘      │ avec IA   │   └──────────┘
                                 └───────────┘

┌──────────┐
│  Admin   │
└────┬─────┘
     │
     ├──────────► Gérer utilisateurs
     │
     ├──────────► Modérer produits
     │
     └──────────► Voir statistiques
```

## Diagramme de séquence - Passer une commande

```
Client      Frontend      Backend       Database      CartStore
  │             │             │             │              │
  │  Voir panier│             │             │              │
  │────────────►│             │             │              │
  │             │ GET /cart   │             │              │
  │             │────────────►│             │              │
  │             │             │ SELECT cart │              │
  │             │             │────────────►│              │
  │             │             │◄────────────│              │
  │             │◄────────────│             │              │
  │◄────────────│             │             │              │
  │             │             │             │              │
  │  Commander  │             │             │              │
  │────────────►│             │             │              │
  │             │POST /orders/│             │              │
  │             │  from-cart  │             │              │
  │             │────────────►│             │              │
  │             │             │ BEGIN TX    │              │
  │             │             │────────────►│              │
  │             │             │             │              │
  │             │             │ INSERT order│              │
  │             │             │────────────►│              │
  │             │             │             │              │
  │             │             │UPDATE stock │              │
  │             │             │────────────►│              │
  │             │             │             │              │
  │             │             │DELETE cart  │              │
  │             │             │────────────►│              │
  │             │             │             │              │
  │             │             │ COMMIT TX   │              │
  │             │             │────────────►│              │
  │             │             │◄────────────│              │
  │             │◄────────────│             │              │
  │◄────────────│             │             │              │
  │             │             │             │              │
  │  Redirect   │             │             │              │
  │────────────►│             │             │              │
  │   /orders   │             │             │              │
```

## Diagramme de séquence - Génération IA

```
Vendeur    Frontend    Backend    AIService    OpenAI API
  │            │          │           │             │
  │ Générer   │          │           │             │
  │ description│         │           │             │
  │───────────►│         │           │             │
  │            │ POST    │           │             │
  │            │/ai/gen..│           │             │
  │            │────────►│           │             │
  │            │         │generate() │             │
  │            │         │──────────►│             │
  │            │         │           │ POST        │
  │            │         │           │completion   │
  │            │         │           │────────────►│
  │            │         │           │◄────────────│
  │            │         │           │  response   │
  │            │         │◄──────────│             │
  │            │◄────────│           │             │
  │◄───────────│         │           │             │
  │            │         │           │             │
  │ Modifier   │         │           │             │
  │ si besoin  │         │           │             │
  │───────────►│         │           │             │
  │            │         │           │             │
  │ Sauvegarder│         │           │             │
  │───────────►│         │           │             │
  │            │ POST    │           │             │
  │            │/products│           │             │
  │            │────────►│           │             │
  │            │         │ INSERT    │             │
  │            │         │ product   │             │
  │            │◄────────│           │             │
  │◄───────────│         │           │             │
```

## Diagramme d'états - Commande

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                         │
                         │ Confirmation
                         │
                    ┌────▽────────┐
                    │ CONFIRMED   │
                    └────┬────────┘
                         │
                         │ Expédition
                         │
                    ┌────▽────────┐
                    │  SHIPPED    │
                    └────┬────────┘
                         │
                         │ Livraison
                         │
                    ┌────▽────────┐
                    │ DELIVERED   │
                    └─────────────┘
                    
                         │
                         │ Annulation (depuis n'importe quel état)
                         │
                    ┌────▽────────┐
                    │ CANCELLED   │
                    └─────────────┘
```

## Diagramme d'architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Pages   │  │Components│  │  State (Zustand) │ │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │                  │            │
│       └─────────────┼──────────────────┘            │
│                     │                               │
│            ┌────────▽────────┐                      │
│            │  API Service    │                      │
│            │    (Axios)      │                      │
│            └────────┬────────┘                      │
└─────────────────────┼───────────────────────────────┘
                      │ HTTP/REST + JWT
                      │
┌─────────────────────▽───────────────────────────────┐
│                   BACKEND LAYER                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Routes  │  │ Services │  │   Dependencies   │ │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │                  │            │
│       └─────────────┼──────────────────┘            │
│                     │                               │
│            ┌────────▽────────┐                      │
│            │     Models      │                      │
│            │   (SQLAlchemy)  │                      │
│            └────────┬────────┘                      │
└─────────────────────┼───────────────────────────────┘
                      │ SQL
                      │
┌─────────────────────▽───────────────────────────────┐
│                  DATABASE LAYER                      │
│                                                      │
│               ┌──────────────┐                       │
│               │  PostgreSQL  │                       │
│               │   Database   │                       │
│               └──────────────┘                       │
└──────────────────────────────────────────────────────┘

                      │ HTTP API
                      │
                  ┌───▽────┐
                  │ OpenAI │
                  │   API  │
                  └────────┘
```

---

**Légende** :

- `┌─┐` : Classe / Module
- `───►` : Relation / Flux
- `△` : Héritage
- `◄───►` : Association bidirectionnelle
- `1..N` : Cardinalité (1 à plusieurs)

---

Ces diagrammes illustrent l'architecture et les interactions du système Marketplace.
