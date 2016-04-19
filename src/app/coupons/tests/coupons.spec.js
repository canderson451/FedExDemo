describe('Component: Coupons', function() {
    var scope,
        q,
        coupon,
        oc;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, OrderCloud) {
        q = $q;
        scope = $rootScope.$new();
        coupon = {
            ID: "TestCoupon123456789",
            CouponCode: "TestCoupon123456789",
            Label: "TestCoupon123456789",
            Description: "TestCoupon123456789",
            DiscountAmountType: "FlatAmountPerOrder",
            Enabled: true,
            RedeemLimit: 1,
            StartDate: null,
            ExpirationDate: null,
            DiscountAmount: 5.0,
            MinimumPurchase: 5.0,
            CouponType: "Order",
            ApplyToSubtotal: false,
            ApplyToShipping: false,
            ApplyToTax: false,
            Status: "Active"
        };
        oc = OrderCloud;
    }));

    describe('State: coupons', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('coupons');
            spyOn(oc.Coupons, 'List').and.returnValue(null);
        }));
        it('should resolve CouponList', inject(function ($injector) {
            $injector.invoke(state.resolve.CouponList);
            expect(oc.Coupons.List).toHaveBeenCalled();
        }));
    });

    describe('State: coupons.edit', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('coupons.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(oc.Coupons, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedCoupon', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.SelectedCoupon);
            expect(oc.Coupons.Get).toHaveBeenCalledWith($stateParams.couponid);
        }));
    });

    describe('State: coupons.assignParty', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('coupons.assignParty');
            spyOn(oc.Buyers, 'Get').and.returnValue(null);
            spyOn(oc.UserGroups, 'List').and.returnValue(null);
            spyOn(oc.Coupons, 'ListAssignments').and.returnValue(null);
            spyOn(oc.Coupons, 'Get').and.returnValue(null);
        }));
        it('should resolve Buyer', inject(function ($injector) {
            $injector.invoke(state.resolve.Buyer);
            expect(oc.Buyers.Get).toHaveBeenCalled();
        }));
        it('should resolve UserGroupList', inject(function ($injector) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(oc.UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUserGroups', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(oc.Coupons.ListAssignments).toHaveBeenCalledWith($stateParams.couponid);
        }));
        it('should resolve SelectedCoupon', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.SelectedCoupon);
            expect(oc.Coupons.Get).toHaveBeenCalledWith($stateParams.couponid);
        }));
    });

    describe('State: coupons.assignProduct', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('coupons.assignProduct');
            spyOn(oc.Products, 'List').and.returnValue(null);
            spyOn(oc.Coupons, 'Get').and.returnValue(null);
            spyOn(oc.Coupons, 'ListProductAssignments').and.returnValue(null);
        }));
        it('should resolve ProductList', inject(function ($injector) {
            $injector.invoke(state.resolve.ProductList);
            expect(oc.Products.List).toHaveBeenCalled();
        }));
        it('should resolve ProductAssignments', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.ProductAssignments);
            expect(oc.Coupons.ListProductAssignments).toHaveBeenCalledWith($stateParams.couponid);
        }));
        it('should resolve SelectedCoupon', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.SelectedCoupon);
            expect(oc.Coupons.Get).toHaveBeenCalledWith($stateParams.couponid);
        }));
    });

    describe('State: coupons.assignCategory', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('coupons.assignCategory');
            spyOn(oc.Categories, 'List').and.returnValue(null);
            spyOn(oc.Coupons, 'Get').and.returnValue(null);
            spyOn(oc.Coupons, 'ListCategoryAssignments').and.returnValue(null);
        }));
        it('should resolve CategoryList', inject(function ($injector) {
            $injector.invoke(state.resolve.CategoryList);
            expect(oc.Categories.List).toHaveBeenCalled();
        }));
        it('should resolve CategoryAssignments', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.CategoryAssignments);
            expect(oc.Coupons.ListCategoryAssignments).toHaveBeenCalledWith($stateParams.couponid);
        }));
        it('should resolve SelectedCoupon', inject(function ($injector, $stateParams) {
            $injector.invoke(state.resolve.SelectedCoupon);
            expect(oc.Coupons.Get).toHaveBeenCalledWith($stateParams.couponid);
        }));
    });

    describe('Controller: CouponEditCtrl', function() {
        var couponEditCtrl;
        beforeEach(inject(function($state, $controller) {
            couponEditCtrl = $controller('CouponEditCtrl', {
                $scope: scope,
                SelectedCoupon: coupon
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(function() {
                couponEditCtrl.coupon = coupon;
                couponEditCtrl.couponID = "TestCoupon123456789";
                var defer = q.defer();
                defer.resolve(coupon);
                spyOn(oc.Coupons, 'Update').and.returnValue(defer.promise);
                couponEditCtrl.Submit();
                scope.$digest();
            });
            it ('should call the Coupons Update method', function() {
                expect(oc.Coupons.Update).toHaveBeenCalledWith(couponEditCtrl.couponID, couponEditCtrl.coupon);
            });
            it ('should enter the coupons state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('coupons', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(function() {
                var defer = q.defer();
                defer.resolve(coupon);
                spyOn(oc.Coupons, 'Delete').and.returnValue(defer.promise);
                couponEditCtrl.Delete();
                scope.$digest();
            });
            it ('should call the Coupons Delete method', function() {
                expect(oc.Coupons.Delete).toHaveBeenCalledWith(coupon.ID);
            });
            it ('should enter the coupons state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('coupons', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CouponCreateCtrl', function() {
        var couponCreateCtrl;
        var code;
        beforeEach(inject(function($state, $controller) {
            couponCreateCtrl = $controller('CouponCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('GenerateCode', function() {
            beforeEach(inject(function() {
                code = couponCreateCtrl.GenerateCode(16);
            }));
            it ('should return 16 digit code', inject(function() {
                expect(code.length).toEqual(16);
            }));
        });

        describe('Submit', function() {
            beforeEach(function() {
                couponCreateCtrl.coupon = coupon;
                var defer = q.defer();
                defer.resolve(coupon);
                spyOn(oc.Coupons, 'Create').and.returnValue(defer.promise);
                couponCreateCtrl.Submit();
                scope.$digest();
            });
            it ('should call the Coupons Create method', function() {
                expect(oc.Coupons.Create).toHaveBeenCalledWith(coupon);
            });
            it ('should enter the coupons state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('coupons', {}, {reload:true});
            }));
        });
    });

    describe('Controller: CouponAssignCtrl', function() {
        var couponAssignCtrl;
        beforeEach(inject(function($state, $controller) {
            couponAssignCtrl = $controller('CouponAssignCtrl', {
                $scope: scope,
                Buyer: {},
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedCoupon: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                spyOn(Assignments, 'saveAssignments').and.returnValue(null);
                couponAssignCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                couponAssignCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });

    describe('Controller: CouponAssignProductCtrl', function() {
        var couponAssignProductCtrl;
        beforeEach(inject(function($state, $controller) {
            couponAssignProductCtrl = $controller('CouponAssignProductCtrl', {
                $scope: scope,
                ProductList: [],
                ProductAssignments: [],
                SelectedCoupon: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                spyOn(Assignments, 'saveAssignments').and.returnValue(null);
                couponAssignProductCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                couponAssignProductCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });

    describe('Controller: CouponAssignCategoryCtrl', function() {
        var couponAssignCategoryCtrl;
        beforeEach(inject(function($state, $controller) {
            couponAssignCategoryCtrl = $controller('CouponAssignCategoryCtrl', {
                $scope: scope,
                CategoryList: [],
                CategoryAssignments: [],
                SelectedCoupon: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                spyOn(Assignments, 'saveAssignments').and.returnValue(null);
                couponAssignCategoryCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                spyOn(Paging, 'paging').and.returnValue(null);
                couponAssignCategoryCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });
});

