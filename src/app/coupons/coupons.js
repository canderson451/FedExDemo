angular.module( 'orderCloud' )

    .config( CouponsConfig )
    .controller( 'CouponsCtrl', CouponsController )
    .controller( 'CouponEditCtrl', CouponEditController )
    .controller( 'CouponCreateCtrl', CouponCreateController )
    .controller( 'CouponAssignCtrl', CouponAssignController )
    .controller( 'CouponAssignProductCtrl', CouponAssignProductController )
    .controller( 'CouponAssignCategoryCtrl', CouponAssignCategoryController )

;

function CouponsConfig( $stateProvider ) {
    $stateProvider
        .state( 'coupons', {
            parent: 'base',
            url: '/coupons',
            templateUrl:'coupons/templates/coupons.tpl.html',
            controller:'CouponsCtrl',
            controllerAs: 'coupons',
            data: {componentName: 'Coupons'},
            resolve: {
                CouponList: function(OrderCloud) {
                    return OrderCloud.Coupons.List();
                }
            }
        })
        .state( 'coupons.edit', {
            url: '/:couponid/edit',
            templateUrl:'coupons/templates/couponEdit.tpl.html',
            controller:'CouponEditCtrl',
            controllerAs: 'couponEdit',
            resolve: {
                SelectedCoupon: function($q, $stateParams, OrderCloud) {
                    var d = $q.defer();
                    OrderCloud.Coupons.Get($stateParams.couponid)
                        .then(function(coupon) {
                            if(coupon.StartDate != null)
                                coupon.StartDate = new Date(coupon.StartDate);
                            if(coupon.ExpirationDate != null)
                                coupon.ExpirationDate = new Date(coupon.ExpirationDate);
                            d.resolve(coupon);
                        });
                    return d.promise;
                }
            }
        })
        .state( 'coupons.create', {
            url: '/coupons/create',
            templateUrl: 'coupons/templates/couponCreate.tpl.html',
            controller: 'CouponCreateCtrl',
            controllerAs: 'couponCreate'
        })
        .state( 'coupons.assignParty', {
            url: '/:couponid/assign/party',
            templateUrl: 'coupons/templates/couponAssignParty.tpl.html',
            controller: 'CouponAssignCtrl',
            controllerAs: 'couponAssign',
            resolve: {
                Buyer: function(OrderCloud) {
                    return OrderCloud.Buyers.Get();
                },
                UserGroupList: function(OrderCloud) {
                    return OrderCloud.UserGroups.List(null, 1, 20);
                },
                AssignedUserGroups: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.ListAssignments($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.Get($stateParams.couponid);
                }
            }
        })
        .state( 'coupons.assignProduct', {
            url: '/:couponid/assign/product',
            templateUrl: 'coupons/templates/couponAssignProduct.tpl.html',
            controller: 'CouponAssignProductCtrl',
            controllerAs: 'couponAssignProd',
            resolve: {
                ProductList: function(OrderCloud) {
                    return OrderCloud.Products.List();
                },
                ProductAssignments: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.ListProductAssignments($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.Get($stateParams.couponid);
                }
            }
        })
        .state( 'coupons.assignCategory', {
            url: '/:couponid/assign/category',
            templateUrl: 'coupons/templates/couponAssignCategory.tpl.html',
            controller: 'CouponAssignCategoryCtrl',
            controllerAs: 'couponAssignCat',
            resolve: {
                CategoryList: function(OrderCloud) {
                    return OrderCloud.Categories.List();
                },
                CategoryAssignments: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.ListCategoryAssignments($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, OrderCloud) {
                    return OrderCloud.Coupons.Get($stateParams.couponid);
                }
            }
        });
}

function CouponsController( CouponList, TrackSearch ) {
    var vm = this;
    vm.list = CouponList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function CouponEditController( $exceptionHandler, $state, SelectedCoupon, OrderCloud, toastr ) {
    var vm = this,
        couponid = SelectedCoupon.ID;
    vm.couponName = SelectedCoupon.Label;
    vm.coupon = SelectedCoupon;

    vm.Submit = function() {
        OrderCloud.Coupons.Update(couponid, vm.coupon)
            .then(function() {
                $state.go('coupons', {}, {reload:true});
                toastr.success('Coupon Edited', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        OrderCloud.Coupons.Delete(SelectedCoupon.ID)
            .then(function() {
                $state.go('coupons', {}, {reload:true});
                toastr.success('Coupon Deleted', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CouponCreateController( $exceptionHandler, $state, OrderCloud, toastr) {
    var vm = this;
    vm.coupon = {};
    vm.coupon.MinimumPurchase = 0;

    vm.GenerateCode = function(bits) {
        bits = typeof  bits !== 'undefined' ? bits : 16;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var code = "";
        for (var i = 0; i < bits; i += 1) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return code;
    };

    vm.Submit = function() {
        OrderCloud.Coupons.Create(vm.coupon)
            .then(function() {
                $state.go('coupons', {}, {reload:true});
                toastr.success('Coupon Created', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CouponAssignController(OrderCloud, Buyer, UserGroupList, AssignedUserGroups, SelectedCoupon, Assignments, Paging, toastr) {
    var vm = this;
    vm.coupon = SelectedCoupon;
    vm.buyer = Buyer;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.saveAssignments = saveAssignments;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return OrderCloud.Coupons.SaveAssignment({
            UserID: null,
            UserGroupID: ItemID,
            CouponID: vm.coupon.ID
        });
    }

    function DeleteFunc(ItemID) {
        return OrderCloud.Coupons.DeleteAssignment(vm.coupon.ID, null, ItemID);
    }

    function saveAssignments() {
        toastr.success('Assignment Updated', 'Success');
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserGroupID');
    }

    function AssignmentFunc() {
        return OrderCloud.Coupons.ListAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'UserGroups', vm.assignments, AssignmentFunc);
    }
}

function CouponAssignProductController(OrderCloud, ProductList, ProductAssignments, SelectedCoupon, Assignments, Paging, toastr) {
    var vm = this;
    vm.list = ProductList;
    vm.assignments = ProductAssignments;
    vm.coupon = SelectedCoupon;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return OrderCloud.Coupons.SaveProductAssignment({
            CouponID: vm.coupon.ID,
            ProductID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return OrderCloud.Coupons.DeleteProductAssignment(vm.coupon.ID, ItemID);
    }

    function SaveAssignment() {
        toastr.success('Assignment Updated', 'Success');
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function AssignmentFunc() {
        return OrderCloud.Coupons.ListProductAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}

function CouponAssignCategoryController(OrderCloud, CategoryList, CategoryAssignments, SelectedCoupon, Assignments, Paging, toastr) {
    var vm = this;
    vm.list = CategoryList;
    vm.assignments = CategoryAssignments;
    vm.coupon = SelectedCoupon;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return OrderCloud.Coupons.SaveCategoryAssignment({
            CouponID: vm.coupon.ID,
            CategoryID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return OrderCloud.Coupons.DeleteCategoryAssignment(vm.coupon.ID, ItemID);
    }

    function SaveAssignment() {
        toastr.success('Assignment Updated', 'Success');
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'CategoryID');
    }

    function AssignmentFunc() {
        return OrderCloud.Coupons.ListCategoryAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Categories', vm.assignments, AssignmentFunc);
    }
}
